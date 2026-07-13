$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Resolve-Path "."
$outputDir = Join-Path $root "outputs\presupuestos"
$outputFile = Join-Path $outputDir "Plantilla_Presupuesto_SSCC.xlsx"
$tmpDir = Join-Path $outputDir "_xlsx_template"

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
  $dir = Split-Path $path -Parent
  if ($dir) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
}

if (Test-Path $tmpDir) { Remove-Item -LiteralPath $tmpDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'@

$rels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'@

$workbook = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Presupuesto" sheetId="1" r:id="rId1"/>
    <sheet name="Items" sheetId="2" r:id="rId2"/>
    <sheet name="Listas" sheetId="3" r:id="rId3"/>
    <sheet name="Instrucciones" sheetId="4" r:id="rId4"/>
  </sheets>
</workbook>
'@

$workbookRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet4.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
'@

$styles = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="4">
    <numFmt numFmtId="164" formatCode="#,##0.00"/>
    <numFmt numFmtId="165" formatCode="$ #,##0.00"/>
    <numFmt numFmtId="166" formatCode="US$ #,##0.00"/>
    <numFmt numFmtId="167" formatCode="0.00%"/>
  </numFmts>
  <fonts count="4">
    <font><sz val="11"/><color rgb="FF17202A"/><name val="Calibri"/></font>
    <font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FF0F766E"/><name val="Calibri"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE6FFFB"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFD9E1E8"/></left><right style="thin"><color rgb="FFD9E1E8"/></right><top style="thin"><color rgb="FFD9E1E8"/></top><bottom style="thin"><color rgb="FFD9E1E8"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="9">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1"/></xf>
    <xf numFmtId="164" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="165" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="166" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>
'@

function SheetXml($dimension, $cols, $rows, $validations = "") {
  return "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?>" +
    "<worksheet xmlns=`"http://schemas.openxmlformats.org/spreadsheetml/2006/main`" xmlns:r=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships`">" +
    "<dimension ref=`"$dimension`"/><sheetViews><sheetView workbookViewId=`"0`"><pane ySplit=`"1`" topLeftCell=`"A2`" activePane=`"bottomLeft`" state=`"frozen`"/></sheetView></sheetViews>" +
    "<sheetFormatPr defaultRowHeight=`"18`"/><cols>$cols</cols><sheetData>$($rows -join '')</sheetData>$validations</worksheet>"
}

$budgetRows = @()
$budgetRows += RowXml 1 @((InlineCell 1 1 "PLANTILLA DE PRESUPUESTO SSCC" 1)) 26
$budgetRows += RowXml 3 @((InlineCell 3 1 "Campo" 2), (InlineCell 3 2 "Valor" 2), (InlineCell 3 3 "Notas para importar al CRM" 2))
$budgetData = @(
  @("Cliente", "Nombre del cliente", "Obligatorio"),
  @("Numero", "P-00000", "Opcional: si viene vacio lo puede generar el CRM"),
  @("Titulo", "Instalacion / reparacion", "Obligatorio"),
  @("Servicio", "CCTV", "CCTV, alarma, acceso, red, mantenimiento"),
  @("Moneda", "USD", "USD o UYU"),
  @("Tipo cambio USD/UYU", 40, "Usado solo para estimaciones"),
  @("Validez", "15 dias", "Texto libre"),
  @("Tiempo ejecucion", "1 dia", "Texto libre"),
  @("Garantia", "12 meses", "Texto libre"),
  @("Forma de pago", "Entrega, saldo contra instalacion, transferencia", "Texto libre"),
  @("Condiciones", "Precios sujetos a disponibilidad y aprobacion del cliente.", "Texto visible en presupuesto"),
  @("Subtotal", "=SUM(Items!K2:K201)", "Formula automatica"),
  @("Descuento", 0, "Importe de descuento"),
  @("IVA %", 0, "0 si es sin IVA, 0.22 si aplica 22%"),
  @("IVA", "=(B15-B16)*B17", "Formula automatica"),
  @("Total", "=B15-B16+B18", "Total final a importar")
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
$budgetCols = '<col min="1" max="1" width="24" customWidth="1"/><col min="2" max="2" width="44" customWidth="1"/><col min="3" max="3" width="58" customWidth="1"/>'
$budgetXml = SheetXml "A1:C20" $budgetCols $budgetRows

$itemRows = @()
$headers = @("Tipo", "Codigo/SKU", "Descripcion", "Unidad", "Cantidad", "Precio unitario", "Costo unitario opcional", "Proveedor opcional", "Origen almacen", "Moneda", "Total")
$cells = @()
for ($c = 1; $c -le $headers.Count; $c++) { $cells += InlineCell 1 $c $headers[$c - 1] 2 }
$itemRows += RowXml 1 $cells 28
$examples = @(
  @("MATERIAL", "ART-0001", "Camara turret 2MP color vu", "u", 4, 27.20, "", "General Security", "SI", "USD"),
  @("MATERIAL", "", "Cable UTP exterior categoria 5E 300m", "rollo", 1, 155.00, 0, "Ganancia extra / sin compra asociada", "NO", "USD"),
  @("MANO_OBRA", "", "Instalacion, configuracion y puesta en marcha", "servicio", 1, 370.00, "", "", "NO", "USD"),
  @("GASTO", "", "Combustible / traslado estimado", "recorrido", 1, 25.00, "", "", "NO", "USD")
)
$r = 2
foreach ($ex in $examples) {
  $row = @(
    InlineCell $r 1 $ex[0] 3
    InlineCell $r 2 $ex[1] 3
    InlineCell $r 3 $ex[2] 3
    InlineCell $r 4 $ex[3] 3
    NumberCell $r 5 $ex[4] 4
    NumberCell $r 6 $ex[5] 6
  )
  if ($ex[6] -eq "") { $row += InlineCell $r 7 "" 3 } else { $row += NumberCell $r 7 $ex[6] 6 }
  $row += InlineCell $r 8 $ex[7] 3
  $row += InlineCell $r 9 $ex[8] 3
  $row += InlineCell $r 10 $ex[9] 3
  $row += FormulaCell $r 11 "IF(OR(E$r=`"`",F$r=`"`"),`"`",E$r*F$r)" 6
  $itemRows += RowXml $r $row 36
  $r++
}
for ($r = 6; $r -le 201; $r++) {
  $row = @()
  for ($c = 1; $c -le 10; $c++) { $row += InlineCell $r $c "" 3 }
  $row += FormulaCell $r 11 "IF(OR(E$r=`"`",F$r=`"`"),`"`",E$r*F$r)" 6
  $itemRows += RowXml $r $row 20
}
$itemCols = '<col min="1" max="1" width="16" customWidth="1"/><col min="2" max="2" width="16" customWidth="1"/><col min="3" max="3" width="48" customWidth="1"/><col min="4" max="4" width="12" customWidth="1"/><col min="5" max="7" width="16" customWidth="1"/><col min="8" max="9" width="22" customWidth="1"/><col min="10" max="11" width="14" customWidth="1"/>'
$validations = '<dataValidations count="4"><dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="A2:A201"><formula1>Listas!$A$2:$A$4</formula1></dataValidation><dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="D2:D201"><formula1>Listas!$B$2:$B$12</formula1></dataValidation><dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="I2:I201"><formula1>Listas!$C$2:$C$3</formula1></dataValidation><dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="J2:J201"><formula1>Listas!$D$2:$D$3</formula1></dataValidation></dataValidations>'
$itemsXml = SheetXml "A1:K201" $itemCols $itemRows $validations

$listRows = @()
$listRows += RowXml 1 @((InlineCell 1 1 "Tipos" 2), (InlineCell 1 2 "Unidades" 2), (InlineCell 1 3 "Origen almacen" 2), (InlineCell 1 4 "Monedas" 2))
$listValues = @(
  @("MATERIAL", "u", "SI", "USD"),
  @("MANO_OBRA", "servicio", "NO", "UYU"),
  @("GASTO", "metro", "", ""),
  @("", "rollo", "", ""),
  @("", "caja", "", ""),
  @("", "recorrido", "", ""),
  @("", "hora", "", ""),
  @("", "dia", "", ""),
  @("", "km", "", ""),
  @("", "pack", "", ""),
  @("", "global", "", "")
)
$r = 2
foreach ($lv in $listValues) {
  $listRows += RowXml $r @((InlineCell $r 1 $lv[0] 3), (InlineCell $r 2 $lv[1] 3), (InlineCell $r 3 $lv[2] 3), (InlineCell $r 4 $lv[3] 3))
  $r++
}
$listCols = '<col min="1" max="4" width="20" customWidth="1"/>'
$listXml = SheetXml "A1:D12" $listCols $listRows

$instRows = @()
$instRows += RowXml 1 @((InlineCell 1 1 "COMO USAR ESTA PLANTILLA" 1)) 26
$instructions = @(
  "Esta plantilla es para PRESUPUESTOS, no para cargar stock ni facturas de almacen.",
  "La hoja Presupuesto contiene cabecera, condiciones, forma de pago y total.",
  "La hoja Items contiene los materiales, mano de obra y gastos que se cotizan al cliente.",
  "Tipo MATERIAL: articulo presupuestado. Puede venir del almacen o ser solo cotizado.",
  "Tipo MANO_OBRA: trabajo tecnico, instalacion, configuracion, mantenimiento.",
  "Tipo GASTO: traslado, combustible, viaticos u otro costo presupuestado al cliente.",
  "Origen almacen = SI significa que al aprobar se intentara vincular/retirar del almacen.",
  "Origen almacen = NO significa que no debe tocar stock; sirve para ganancia pura, servicios o items externos.",
  "Costo unitario opcional puede quedar vacio. Si es 0, el presupuesto vende el item pero no genera costo.",
  "No cambiar los nombres de las hojas ni de las columnas para que el CRM pueda importarlo."
)
$r = 3
foreach ($text in $instructions) {
  $instRows += RowXml $r @((InlineCell $r 1 $text 8)) 24
  $r++
}
$instCols = '<col min="1" max="1" width="110" customWidth="1"/>'
$instXml = SheetXml "A1:A13" $instCols $instRows

$core = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Plantilla de Presupuesto SSCC</dc:title>
  <dc:creator>Security Solutions Control Center</dc:creator>
  <cp:lastModifiedBy>Security Solutions Control Center</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-07-12T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-07-12T00:00:00Z</dcterms:modified>
</cp:coreProperties>
'@

$app = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Security Solutions Control Center</Application>
</Properties>
'@

WriteText (Join-Path $tmpDir "[Content_Types].xml") $contentTypes
WriteText (Join-Path $tmpDir "_rels\.rels") $rels
WriteText (Join-Path $tmpDir "xl\workbook.xml") $workbook
WriteText (Join-Path $tmpDir "xl\_rels\workbook.xml.rels") $workbookRels
WriteText (Join-Path $tmpDir "xl\styles.xml") $styles
WriteText (Join-Path $tmpDir "xl\worksheets\sheet1.xml") $budgetXml
WriteText (Join-Path $tmpDir "xl\worksheets\sheet2.xml") $itemsXml
WriteText (Join-Path $tmpDir "xl\worksheets\sheet3.xml") $listXml
WriteText (Join-Path $tmpDir "xl\worksheets\sheet4.xml") $instXml
WriteText (Join-Path $tmpDir "docProps\core.xml") $core
WriteText (Join-Path $tmpDir "docProps\app.xml") $app

if (Test-Path $outputFile) { Remove-Item -LiteralPath $outputFile -Force }
$zipPath = "$outputFile.zip"
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmpDir, $zipPath)
Move-Item -LiteralPath $zipPath -Destination $outputFile -Force
Remove-Item -LiteralPath $tmpDir -Recurse -Force

Write-Output $outputFile
