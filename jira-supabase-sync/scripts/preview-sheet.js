/* global process */
import axios from "axios"
import { parse } from "csv-parse/sync"
import { mapSheetRows } from "../src/utils/sheet-mapper.js"

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTn7C3JqBIEEMzWv5mv-kzgvko3yzBeTdZi2VT7HDV85_kgf6-WuGg7B1O0yG7kWFJBNqRtRK9NKdH1/pub?output=csv"

async function main() {
  console.log("Downloading sheet...")
  const response = await axios.get(SHEET_URL, { responseType: "text" })
  const csvText = response.data

  const records = parse(csvText, {
    skip_empty_lines: true,
  })

  if (!records.length) {
    throw new Error("No rows found in CSV")
  }

  const [header, ...rows] = records
  console.log(`Header columns: ${header.length}`)
  console.log(`Rows: ${rows.length}`)

  const mapped = mapSheetRows({ header, rows })

  // Compute non-empty counts for key fields
  const counters = {}
  mapped.forEach((row) => {
    Object.entries(row).forEach(([k, v]) => {
      if (v === undefined || v === null || String(v).trim() === "") return
      counters[k] = (counters[k] || 0) + 1
    })
  })

  const topFields = Object.entries(counters)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

  console.log("Top fields by non-empty count:")
  topFields.forEach(([k, v]) => console.log(`- ${k}: ${v}/${mapped.length}`))

  console.log("\nSample rows (first 2):")
  mapped.slice(0, 2).forEach((row, idx) => {
    console.log(`Row ${idx + 1}:`, row)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
