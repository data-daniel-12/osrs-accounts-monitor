#!/usr/bin/env python3
"""
OSRS Account Availability Monitor & Webhook Simulator (Python Edition)
Consulta la hoja de Google Sheets en tiempo real y detecta cambios en la columna 'Available'.
"""

import urllib.request
import json
import time
import os
import sys
from datetime import datetime

SHEET_ID = "1LLjq5dvk6-jGYYjodozsk7x1BFPhHKje9jNGM68GpQM"
SHEET_NAME = "Accounts available"
GVIZ_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet={urllib.parse.quote(SHEET_NAME)}"

# Configura aquí tu webhook de Discord si deseas alertas en tu canal
DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "")
POLL_INTERVAL = int(os.environ.get("POLL_INTERVAL", 15))


def fetch_sheet_raw():
    """Descarga el payload JSON de la API de visualización de Google Sheets."""
    req = urllib.request.Request(
        GVIZ_URL,
        headers={"User-Agent": "Mozilla/5.0 (OSRS Availability Monitor Python/1.0)"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        text = resp.read().decode("utf-8")
    
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError("Respuesta no válida de Google Sheets")
    return json.loads(text[start:end])


def parse_accounts(raw_data):
    """
    Parsea las filas del GViz de Google Sheets:
    - Retorna lista completa de cuentas
    - Diccionario { row: available }
    - Diccionario { id: available }
    """
    rows = raw_data.get("table", {}).get("rows", [])
    accounts = []
    by_row = {}
    by_id = {}

    current_cat = "General"
    account_id = 1

    for i, r in enumerate(rows):
        sheet_row = i + 2  # Fila 1 es header en Google Sheets
        c = r.get("c") or []

        col0 = str(c[0]["v"]).strip() if len(c) > 0 and c[0] and c[0].get("v") is not None else ""
        col1 = str(c[1]["v"]).strip() if len(c) > 1 and c[1] and c[1].get("v") is not None else ""
        col2 = c[2].get("v") if len(c) > 2 and c[2] else None
        col3 = c[3].get("v") if len(c) > 3 and c[3] else 0

        # Encabezado de categoría
        if col1.lower() == "max supplies" or (col0 and not col1 and col2 is None and not col3 and ":" not in col0):
            current_cat = col0
            continue

        if not col0 and not col1 and col2 is None and not col3:
            continue

        try:
            available = int(float(col3)) if col3 is not None else 0
        except (ValueError, TypeError):
            available = 0

        price_fmt = f"${col2}" if isinstance(col2, (int, float)) else (str(col2) if col2 else "N/A")
        if len(c) > 2 and c[2] and c[2].get("f"):
            price_fmt = c[2]["f"]

        acc = {
            "id": account_id,
            "row": sheet_row,
            "category": current_cat,
            "build": col0,
            "supplies": col1,
            "price": price_fmt,
            "available": available
        }
        accounts.append(acc)
        by_row[sheet_row] = available
        by_id[account_id] = available
        account_id += 1

    return accounts, by_row, by_id


def get_availability(format="simple", only_in_stock=True):
    """
    Función utilitaria que puedes importar en tus propios scripts:
    Ejemplo:
        from monitor import get_availability
        stock = get_availability(format='simple') # -> {7: 1, 8: 8, ...}
    """
    raw = fetch_sheet_raw()
    accounts, by_row, by_id = parse_accounts(raw)
    
    if format == "simple":
        if only_in_stock:
            return {k: v for k, v in by_row.items() if v > 0}
        return by_row
    elif format == "by_id":
        if only_in_stock:
            return {k: v for k, v in by_id.items() if v > 0}
        return by_id
    elif format == "pairs":
        source = by_row if not only_in_stock else {k: v for k, v in by_row.items() if v > 0}
        return [[k, v] for k, v in source.items()]
    
    return [a for a in accounts if not only_in_stock or a["available"] > 0]


def send_discord_alert(changes):
    """Envía notificación a Discord Webhook con formato OSRS."""
    if not DISCORD_WEBHOOK_URL or not DISCORD_WEBHOOK_URL.startswith("https://discord.com/api/webhooks/"):
        return

    embeds = []
    for ch in changes[:10]:
        color = 0x2ECC71 if ch["diff"] > 0 else 0xE74C3C
        title = "🔥 ¡NUEVO STOCK!" if ch["old"] == 0 and ch["new"] > 0 else ("📈 Stock Subió" if ch["diff"] > 0 else "📉 Stock Bajó")
        
        embeds.append({
            "title": f"{title} | Fila #{ch['row']} (ID #{ch['id']})",
            "description": f"**Categoría:** {ch['category']}\n**Build:** {ch['build'][:240]}",
            "color": color,
            "fields": [
                {
                    "name": "Disponibilidad",
                    "value": f"**{ch['new']}** (antes {ch['old']} | {'+' if ch['diff'] > 0 else ''}{ch['diff']})",
                    "inline": True
                },
                {
                    "name": "Precio",
                    "value": str(ch["price"]),
                    "inline": True
                }
            ],
            "footer": {"text": "OSRS Availability Monitor"},
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })

    payload = json.dumps({
        "content": "🔔 **¡Alerta de Disponibilidad OSRS!**",
        "embeds": embeds
    }).encode("utf-8")

    try:
        req = urllib.request.Request(
            DISCORD_WEBHOOK_URL,
            data=payload,
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
        )
        urllib.request.urlopen(req, timeout=10)
        print("  -> Alerta enviada a Discord exitosamente.")
    except Exception as e:
        print(f"  -> Error al enviar a Discord: {e}")


def main_loop():
    print("=" * 65)
    print("🛡️  OSRS ACCOUNT AVAILABILITY MONITOR (Python Edition)")
    print(f"📡 Sondeando cada {POLL_INTERVAL} segundos...")
    if DISCORD_WEBHOOK_URL:
        print("🔗 Webhook de Discord configurado.")
    else:
        print("ℹ️  Sin webhook de Discord (puedes definir DISCORD_WEBHOOK_URL).")
    print("=" * 65)

    previous_stock = {}
    first_run = True

    while True:
        try:
            raw = fetch_sheet_raw()
            accounts, by_row, by_id = parse_accounts(raw)
            current_time = datetime.now().strftime("%H:%M:%S")

            if first_run:
                previous_stock = by_row.copy()
                in_stock = {k: v for k, v in by_row.items() if v > 0}
                print(f"[{current_time}] Sincronización inicial exitosa.")
                print(f"  Total cuentas analizadas: {len(accounts)}")
                print(f"  Cuentas con disponibilidad > 0: {len(in_stock)}")
                print(f"  Mapa de filas disponibles: {in_stock}\n")
                first_run = False
            else:
                changes = []
                for row_num, current_val in by_row.items():
                    old_val = previous_stock.get(row_num, 0)
                    if old_val != current_val:
                        acc_match = next((a for a in accounts if a["row"] == row_num), None)
                        changes.append({
                            "row": row_num,
                            "id": acc_match["id"] if acc_match else row_num,
                            "category": acc_match["category"] if acc_match else "N/A",
                            "build": acc_match["build"] if acc_match else "",
                            "price": acc_match["price"] if acc_match else "",
                            "old": old_val,
                            "new": current_val,
                            "diff": current_val - old_val
                        })

                if changes:
                    print(f"\n[{current_time}] ⚠️  ¡{len(changes)} CAMBIO(S) DETECTADO(S) EN DISPONIBILIDAD!")
                    for ch in changes:
                        symbol = "🟢 +" if ch["diff"] > 0 else "🔴 "
                        print(f"  Fila #{ch['row']} (ID #{ch['id']}): {ch['old']} -> {ch['new']} ({symbol}{ch['diff']}) | [{ch['category']}] {ch['build'][:45]}...")

                    send_discord_alert(changes)
                    print()
                else:
                    # Sin cambios
                    active_count = sum(1 for v in by_row.values() if v > 0)
                    sys.stdout.write(f"\r[{current_time}] Sin cambios en stock. Cuentas disponibles activas: {active_count}...")
                    sys.stdout.flush()

                previous_stock = by_row.copy()

        except Exception as e:
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Error en sondeo: {e}")

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main_loop()
