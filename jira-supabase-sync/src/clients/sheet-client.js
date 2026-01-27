import axios from "axios"
import { parse } from "csv-parse/sync"
import { mapSheetRows } from "../utils/sheet-mapper.js"

export const DEFAULT_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTn7C3JqBIEEMzWv5mv-kzgvko3yzBeTdZi2VT7HDV85_kgf6-WuGg7B1O0yG7kWFJBNqRtRK9NKdH1/pub?output=csv"

async function fetchSheetCsvText(url) {
  if (!url) {
    throw new Error("fetchSheetCsvText: url is required")
  }
  const response = await axios.get(url, { responseType: "text" })
  return response.data
}

function parseCsvRecords(csvText) {
  const records = parse(csvText, {
    skip_empty_lines: true,
  })

  if (!records.length) {
    throw new Error("parseCsvRecords: no rows found in CSV")
  }

  const [header, ...rows] = records
  return { header, rows }
}

export async function loadSheetData(sheetCsvUrl) {
  const url = sheetCsvUrl || DEFAULT_SHEET_CSV_URL
  const csvText = await fetchSheetCsvText(url)
  const { header, rows } = parseCsvRecords(csvText)
  const mapped = mapSheetRows({ header, rows })
  return { header, rows, mapped }
}
