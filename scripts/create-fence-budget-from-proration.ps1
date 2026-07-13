$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Resolve-Path "."
$template = Join-Path $root "outputs\presupuestos\Plantilla_Presupuesto_SSCC.xlsx"
$outputDir = Join-Path $root "outputs\presupuestos"
$outputFile = Join-Path $outputDir "Presupuesto_Cerco_Electrico_Prorrateado_SSCC.xlsx"
$tmpDir = Join-Path $outputDir "_xlsx_fence_budget"

function XmlEscape([object]$value) {
  if ($null -eq $value) { return "" }
  return [System.Security.SecurityElement]::Escape([string]$value)
}

function CellRef([int]$row, [int]$col) {
  $name = ""
  while ($col -gt 0) {
    $rem = ($col - 1) % 26
    $name = [char](65 + $rem) + $name
    $col = [math]::Floor(($col - 1) / 26)
  }
  return "$name$row"
}

function InlineCell([int]$row, [int]$col, [object]$value, [int]$style = 0) {
  $ref = CellRef $row $col
  $text = XmlEscape $value
  return "<c r=`"$ref`" s=`"$style`" t=`"inlineStr`"><is><t>$text</t></is></c>"
}

function NumberCell([int]$row, [int]$col, [object]$value, [int]$style = 0) {
  $ref = CellRef $row $col
  $number = ([string]$value).Replace(",", ".")
  return "<c r=`"$ref`" s=`"$style`"><v>$number</v></c>"
}

function FormulaCell([int]$row, [int]$col, [string]$formula, [int]$style = 0) {
  $ref = CellRef $row $col
  $escaped = XmlEscape $formula
  return "<c r=`"$ref`" s=`"$style`"><f>$escaped</f></c>"
}

function RowXml([int]$row, [string[]]$cells, [double]$height = 0) {
  $attrs = if ($height -gt 0) { " ht=`"$height`" customHeight=`"1`"" } else { "" }
  return "<row r=`"$row`"$attrs>$($cells -join '')</row>"
}

function WriteText($path, $content) {
  [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
}

function SheetXml($dimension, $cols, $rows, $validations = "") {
  return "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?>" +
    "<worksheet xmlns=`"http://schemas.openxmlformats.org/spreadsheetml/2006/main`" xmlns:r=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships`">" +
    "<dimension ref=`"$dimension`"/><sheetViews><sheetView workbookViewId=`"0`"><pane ySplit=`"1`" topLeftCell=`"A2`" activePane=`"bottomLeft`" state=`"frozen`"/></sheetView></sheetViews>" +
    "<sheetFormatPr defaultRowHeight=`"18`"/><cols>$cols</cols><sheetData>$($rows -join '')</sheetData>$validations</worksheet>"
}

if (!(Test-Path $template)) {
  & (Join-Path $root "scripts\create-budget-template.ps1") | Out-Null
}

if (Test-Path $tmpDir) { Remove-Item -LiteralPath $tmpDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
[System.IO.Compression.ZipFile]::ExtractToDirectory($template, $tmpDir)

$budgetRows = @()
$budgetRows += RowXml 1 @((InlineCell 1 1 "PRESUPUESTO SSCC - CERCO ELECTRICO" 1)) 26
$budgetRows += RowXml 3 @((InlineCell 3 1 "Campo" 2), (InlineCell 3 2 "Valor" 2), (InlineCell 3 3 "Notas para importar al CRM" 2))
$budgetData = @(
  @("Cliente", "Pendiente de cliente", "Completar antes de importar"),
  @("Numero", "P-00000", "Opcional: si queda vacio lo genera el CRM"),
  @("Titulo", "Instalacion de cerco electrico", "Presupuesto armado con prorrateo comercial"),
  @("Servicio", "ELECTRIC_FENCE", "Cerco electrico"),
  @("Moneda", "USD", "Dolares"),
  @("Tipo cambio USD/UYU", 40, "Ajustar si corresponde"),
  @("Validez", "15 dias", "Texto libre"),
  @("Tiempo ejecucion", "A coordinar", "Texto libre"),
  @("Garantia", "12 meses", "Texto libre"),
  @("Forma de pago", "Entrega, saldo contra instalacion, transferencia", "Texto libre"),
  @("Condiciones", "Prorrateo comercial incluido en materiales. El prorrateo no representa costo de almacen.", "Visible en presupuesto"),
  @("Subtotal", "=SUM(Items!K2:K15)", "Formula automatica"),
  @("Descuento", 0, "Importe de descuento"),
  @("IVA %", 0, "Sin IVA"),
  @("IVA", "=(B15-B16)*B17", "Formula automatica"),
  @("Total", "=B15-B16+B18", "Total final")
)

$r = 4
foreach ($entry in $budgetData) {
  $cells = @((InlineCell $r 1 $entry[0] 7))
  if ($entry[1] -is [int] -or $entry[1] -is [double]) {
    $cells += NumberCell $r 2 $entry[1] 4
  } elseif ([string]$entry[1] -like "=*") {
    $cells += FormulaCell $r 2 ([string]$entry[1]).Substring(1) 4
  } else {
    $cells += InlineCell $r 2 $entry[1] 3
  }
  $cells += InlineCell $r 3 $entry[2] 8
  $budgetRows += RowXml $r $cells 22
  $r++
}

$budgetCols = '<col min="1" max="1" width="24" customWidth="1"/><col min="2" max="2" width="48" customWidth="1"/><col min="3" max="3" width="70" customWidth="1"/>'
$budgetXml = SheetXml "A1:C20" $budgetCols $budgetRows

$itemRows = @()
$headers = @("Tipo", "Codigo/SKU", "Descripcion", "Unidad", "Cantidad", "Precio unitario", "Costo unitario opcional", "Proveedor opcional", "Origen almacen", "Moneda", "Total")
$headerCells = @()
for ($c = 1; $c -le $headers.Count; $c++) { $headerCells += InlineCell 1 $c $headers[$c - 1] 2 }
$itemRows += RowXml 1 $headerCells 28

$items = @(
  @("MATERIAL", "", "Electrificador + WiFi", "u", 1, 156.27, 120.00, "Costo base + prorrateo comercial; ajusta US$ 0,01 por redondeo", "NO", "USD"),
  @("MATERIAL", "", "Bateria", "u", 1, 26.05, 20.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MATERIAL", "", "Linga", "u", 1, 455.82, 350.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MATERIAL", "", "Astas", "global", 1, 515.73, 396.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MATERIAL", "", "Varillas de soporte", "global", 1, 208.37, 160.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MATERIAL", "", "Sirena", "u", 1, 13.02, 10.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MATERIAL", "", "Carteles", "global", 1, 37.77, 29.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MATERIAL", "", "Cable alta tension", "global", 1, 78.14, 60.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MATERIAL", "", "Jabalina", "u", 1, 22.14, 17.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MATERIAL", "", "Anclaje quimico", "global", 1, 39.07, 30.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MATERIAL", "", "Electrodos", "global", 1, 36.47, 28.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MATERIAL", "", "Aerosol galvanizado", "global", 1, 36.47, 28.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("GASTO", "", "Insumos sin IVA", "global", 1, 97.68, 75.00, "Costo base + prorrateo comercial", "NO", "USD"),
  @("MANO_OBRA", "", "Mano de obra, instalacion y configuracion", "servicio", 1, 600.00, 0.00, "Mano de obra directa", "NO", "USD")
)

$r = 2
foreach ($item in $items) {
  $row = @(
    InlineCell $r 1 $item[0] 3
    InlineCell $r 2 $item[1] 3
    InlineCell $r 3 $item[2] 3
    InlineCell $r 4 $item[3] 3
    NumberCell $r 5 $item[4] 4
    NumberCell $r 6 $item[5] 6
    NumberCell $r 7 $item[6] 6
    InlineCell $r 8 $item[7] 3
    InlineCell $r 9 $item[8] 3
    InlineCell $r 10 $item[9] 3
  )
  $formula = 'IF(OR(E' + $r + '="",F' + $r + '=""),"",E' + $r + '*F' + $r + ')'
  $row += FormulaCell $r 11 $formula 6
  $itemRows += RowXml $r $row 28
  $r++
}

$itemCols = '<col min="1" max="1" width="16" customWidth="1"/><col min="2" max="2" width="16" customWidth="1"/><col min="3" max="3" width="42" customWidth="1"/><col min="4" max="4" width="12" customWidth="1"/><col min="5" max="7" width="16" customWidth="1"/><col min="8" max="9" width="30" customWidth="1"/><col min="10" max="11" width="14" customWidth="1"/>'
$validations = '<dataValidations count="4"><dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="A2:A201"><formula1>Listas!$A$2:$A$4</formula1></dataValidation><dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="D2:D201"><formula1>Listas!$B$2:$B$12</formula1></dataValidation><dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="I2:I201"><formula1>Listas!$C$2:$C$3</formula1></dataValidation><dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="J2:J201"><formula1>Listas!$D$2:$D$3</formula1></dataValidation></dataValidations>'
$itemsXml = SheetXml "A1:K15" $itemCols $itemRows $validations

WriteText (Join-Path $tmpDir "xl\worksheets\sheet1.xml") $budgetXml
WriteText (Join-Path $tmpDir "xl\worksheets\sheet2.xml") $itemsXml

if (Test-Path $outputFile) { Remove-Item -LiteralPath $outputFile -Force }
$zipPath = "$outputFile.zip"
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmpDir, $zipPath)
Move-Item -LiteralPath $zipPath -Destination $outputFile -Force
Remove-Item -LiteralPath $tmpDir -Recurse -Force

Write-Output $outputFile
