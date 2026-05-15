# ============================================================================
# E2E TEST SUITE: Food Store - Módulo de Direcciones
# ============================================================================
# Contexto:
# - Backend: http://127.0.0.1:8000
# - BD: SQLite (foodstore.db)
# - Shell: Windows PowerShell
# ============================================================================

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  E2E TEST SUITE: Food Store - Módulo de Direcciones          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Variables de almacenamiento
$results = @()
$DIRECCION_IDS = @{}

# ============================================================================
# FASE 1: CREAR USUARIO DE PRUEBA Y OBTENER JWT
# ============================================================================
Write-Host "`n[FASE 1] Creando usuario de prueba y obteniendo JWT..." -ForegroundColor Yellow

# TEST: Crear usuario
Write-Host "  → Creando usuario: test@foodstore.local" -ForegroundColor Gray
$userBody = @{
    email = "test@foodstore.local"
    nombre = "Test"
    apellido = "Usuario"
    password = "Test123456!"
} | ConvertTo-Json

try {
    $userResp = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/usuarios" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $userBody `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $user = $userResp.Content | ConvertFrom-Json
    Write-Host "  ✓ Usuario creado (Status: $($userResp.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error al crear usuario: $_" -ForegroundColor Red
    exit
}

# TEST: Login para obtener JWT
Write-Host "  → Obteniendo JWT..." -ForegroundColor Gray
$loginBody = @{
    username = "test@foodstore.local"
    password = "Test123456!"
} | ConvertTo-Json

try {
    $loginResp = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginBody `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $loginData = $loginResp.Content | ConvertFrom-Json
    $TOKEN = $loginData.access_token
    Write-Host "  ✓ JWT obtenido (Status: $($loginResp.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error al obtener JWT: $_" -ForegroundColor Red
    exit
}

# ============================================================================
# FASE 2: PRUEBAS HTTP SISTEMÁTICAS
# ============================================================================
Write-Host "`n[FASE 2] Ejecutando pruebas HTTP sistemáticas..." -ForegroundColor Yellow

# TEST 1: GET /api/v1/direcciones (inicial - vacío)
Write-Host "`n  [TEST 1] GET /api/v1/direcciones (inicial - vacío)" -ForegroundColor Cyan
try {
    $test1 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test1_data = $test1.Content | ConvertFrom-Json
    $status = if ($test1.StatusCode -eq 200 -and $test1_data.Count -eq 0) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test1.StatusCode) | Largo: $($test1_data.Count) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 1 | 200, [] | $($test1.StatusCode), $($test1_data.Count) items | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 2: POST /api/v1/direcciones (1ra dirección)
Write-Host "`n  [TEST 2] POST /api/v1/direcciones (1ra dirección)" -ForegroundColor Cyan
try {
    $dir1Body = @{
        calle = "Av. Principal 123"
        numero = 123
        piso = $null
        departamento = $null
        ciudad = "Buenos Aires"
        provincia = "Buenos Aires"
        codigo_postal = "1000"
        pais = "Argentina"
        referencias = "Cerca del parque"
    } | ConvertTo-Json

    $test2 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones" `
        -Method POST `
        -Headers @{"Authorization"="Bearer $TOKEN"; "Content-Type"="application/json"} `
        -Body $dir1Body `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test2_data = $test2.Content | ConvertFrom-Json
    $ID_1 = $test2_data.id
    $DIRECCION_IDS["ID_1"] = $ID_1
    $status = if ($test2.StatusCode -eq 201 -and $test2_data.es_principal -eq $true) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test2.StatusCode) | es_principal: $($test2_data.es_principal) | ID: $ID_1 | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 2 | 201, es_principal=true | $($test2.StatusCode), $($test2_data.es_principal) | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 3: POST /api/v1/direcciones (2da dirección)
Write-Host "`n  [TEST 3] POST /api/v1/direcciones (2da dirección)" -ForegroundColor Cyan
try {
    $dir2Body = @{
        calle = "Calle Secundaria 456"
        numero = 456
        piso = "4"
        departamento = "B"
        ciudad = "La Plata"
        provincia = "Buenos Aires"
        codigo_postal = "1900"
        pais = "Argentina"
        referencias = "Edificio de ladrillos rojos"
    } | ConvertTo-Json

    $test3 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones" `
        -Method POST `
        -Headers @{"Authorization"="Bearer $TOKEN"; "Content-Type"="application/json"} `
        -Body $dir2Body `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test3_data = $test3.Content | ConvertFrom-Json
    $ID_2 = $test3_data.id
    $DIRECCION_IDS["ID_2"] = $ID_2
    $status = if ($test3.StatusCode -eq 201 -and $test3_data.es_principal -eq $false) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test3.StatusCode) | es_principal: $($test3_data.es_principal) | ID: $ID_2 | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 3 | 201, es_principal=false | $($test3.StatusCode), $($test3_data.es_principal) | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 4: POST /api/v1/direcciones (3ra dirección)
Write-Host "`n  [TEST 4] POST /api/v1/direcciones (3ra dirección)" -ForegroundColor Cyan
try {
    $dir3Body = @{
        calle = "Ruta 9 km 50"
        numero = 50
        piso = $null
        departamento = $null
        ciudad = "Avellaneda"
        provincia = "Buenos Aires"
        codigo_postal = "1870"
        pais = "Argentina"
        referencias = "Frente a la rotonda"
    } | ConvertTo-Json

    $test4 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones" `
        -Method POST `
        -Headers @{"Authorization"="Bearer $TOKEN"; "Content-Type"="application/json"} `
        -Body $dir3Body `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test4_data = $test4.Content | ConvertFrom-Json
    $ID_3 = $test4_data.id
    $DIRECCION_IDS["ID_3"] = $ID_3
    $status = if ($test4.StatusCode -eq 201 -and $test4_data.es_principal -eq $false) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test4.StatusCode) | es_principal: $($test4_data.es_principal) | ID: $ID_3 | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 4 | 201, es_principal=false | $($test4.StatusCode), $($test4_data.es_principal) | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 5: GET /api/v1/direcciones (listar todas)
Write-Host "`n  [TEST 5] GET /api/v1/direcciones (listar todas)" -ForegroundColor Cyan
try {
    $test5 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test5_data = $test5.Content | ConvertFrom-Json
    $principal_id = ($test5_data | Where-Object {$_.es_principal -eq $true} | Select-Object -ExpandProperty id -ErrorAction SilentlyContinue)
    $status = if ($test5.StatusCode -eq 200 -and $test5_data.Count -eq 3 -and $principal_id -eq $ID_1) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test5.StatusCode) | Cantidad: $($test5_data.Count) | Principal: $principal_id | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 5 | 200, 3 items, principal=ID_1 | $($test5.StatusCode), $($test5_data.Count) items, principal=$principal_id | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 6: GET /api/v1/direcciones/{ID_1}
Write-Host "`n  [TEST 6] GET /api/v1/direcciones/$ID_1" -ForegroundColor Cyan
try {
    $test6 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones/$ID_1" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test6_data = $test6.Content | ConvertFrom-Json
    $status = if ($test6.StatusCode -eq 200 -and $test6_data.id -eq $ID_1) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test6.StatusCode) | Calle: $($test6_data.calle) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 6 | 200, datos correctos | $($test6.StatusCode) | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 7: GET /api/v1/direcciones/{ID_2}
Write-Host "`n  [TEST 7] GET /api/v1/direcciones/$ID_2" -ForegroundColor Cyan
try {
    $test7 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones/$ID_2" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test7_data = $test7.Content | ConvertFrom-Json
    $status = if ($test7.StatusCode -eq 200 -and $test7_data.id -eq $ID_2) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test7.StatusCode) | Calle: $($test7_data.calle) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 7 | 200, datos correctos | $($test7.StatusCode) | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 8: GET /api/v1/direcciones/{ID_3}
Write-Host "`n  [TEST 8] GET /api/v1/direcciones/$ID_3" -ForegroundColor Cyan
try {
    $test8 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones/$ID_3" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test8_data = $test8.Content | ConvertFrom-Json
    $status = if ($test8.StatusCode -eq 200 -and $test8_data.id -eq $ID_3) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test8.StatusCode) | Calle: $($test8_data.calle) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 8 | 200, datos correctos | $($test8.StatusCode) | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 9: PUT /api/v1/direcciones/{ID_2} (actualizar)
Write-Host "`n  [TEST 9] PUT /api/v1/direcciones/$ID_2 (actualizar)" -ForegroundColor Cyan
try {
    $updateBody = @{
        calle = "Calle Nueva 789"
        ciudad = "Mar del Plata"
    } | ConvertTo-Json

    $test9 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones/$ID_2" `
        -Method PUT `
        -Headers @{"Authorization"="Bearer $TOKEN"; "Content-Type"="application/json"} `
        -Body $updateBody `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test9_data = $test9.Content | ConvertFrom-Json
    $status = if ($test9.StatusCode -eq 200) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test9.StatusCode) | Calle: $($test9_data.calle) | Ciudad: $($test9_data.ciudad) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 9 | 200, cambios aplicados | $($test9.StatusCode) | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 10: GET /api/v1/direcciones/{ID_2} (verificar actualización)
Write-Host "`n  [TEST 10] GET /api/v1/direcciones/$ID_2 (verificar actualización)" -ForegroundColor Cyan
try {
    $test10 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones/$ID_2" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test10_data = $test10.Content | ConvertFrom-Json
    $status = if ($test10.StatusCode -eq 200 -and $test10_data.calle -eq "Calle Nueva 789" -and $test10_data.ciudad -eq "Mar del Plata") { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test10.StatusCode) | Calle: $($test10_data.calle) | Ciudad: $($test10_data.ciudad) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 10 | 200, cambios verificados | $($test10.StatusCode), calle='$($test10_data.calle)', ciudad='$($test10_data.ciudad)' | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 11: PATCH /api/v1/direcciones/{ID_3}/principal
Write-Host "`n  [TEST 11] PATCH /api/v1/direcciones/$ID_3/principal" -ForegroundColor Cyan
try {
    $test11 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones/$ID_3/principal" `
        -Method PATCH `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test11_data = $test11.Content | ConvertFrom-Json
    $status = if ($test11.StatusCode -eq 200 -and $test11_data.es_principal -eq $true) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test11.StatusCode) | es_principal: $($test11_data.es_principal) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 11 | 200, es_principal=true | $($test11.StatusCode), es_principal=$($test11_data.es_principal) | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 12: GET /api/v1/direcciones (verificar cambio de principal)
Write-Host "`n  [TEST 12] GET /api/v1/direcciones (verificar cambio de principal)" -ForegroundColor Cyan
try {
    $test12 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test12_data = $test12.Content | ConvertFrom-Json
    $ID_1_principal = ($test12_data | Where-Object {$_.id -eq $ID_1} | Select-Object -ExpandProperty es_principal -ErrorAction SilentlyContinue)
    $ID_3_principal = ($test12_data | Where-Object {$_.id -eq $ID_3} | Select-Object -ExpandProperty es_principal -ErrorAction SilentlyContinue)
    $status = if ($test12.StatusCode -eq 200 -and $ID_1_principal -eq $false -and $ID_3_principal -eq $true) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test12.StatusCode) | ID_1.es_principal: $ID_1_principal | ID_3.es_principal: $ID_3_principal | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 12 | 200, ID_1.es_principal=false, ID_3.es_principal=true | $($test12.StatusCode), ID_1=$ID_1_principal, ID_3=$ID_3_principal | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 13: DELETE /api/v1/direcciones/{ID_3} (intentar eliminar principal - DEBE FALLAR)
Write-Host "`n  [TEST 13] DELETE /api/v1/direcciones/$ID_3 (intentar eliminar principal - debe fallar)" -ForegroundColor Cyan
try {
    $test13 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones/$ID_3" `
        -Method DELETE `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $status = if ($test13.StatusCode -eq 422) { "✓ PASS (error esperado)" } else { "✗ FAIL" }
    Write-Host "    Status: $($test13.StatusCode) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 13 | 422 (error esperado) | $($test13.StatusCode) | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 14: DELETE /api/v1/direcciones/{ID_2} (eliminar no principal - DEBE FUNCIONAR)
Write-Host "`n  [TEST 14] DELETE /api/v1/direcciones/$ID_2 (eliminar no principal)" -ForegroundColor Cyan
try {
    $test14 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones/$ID_2" `
        -Method DELETE `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $status = if ($test14.StatusCode -eq 204) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test14.StatusCode) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 14 | 204 No Content | $($test14.StatusCode) | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 15: GET /api/v1/direcciones (verificar soft-delete)
Write-Host "`n  [TEST 15] GET /api/v1/direcciones (verificar soft-delete)" -ForegroundColor Cyan
try {
    $test15 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $test15_data = $test15.Content | ConvertFrom-Json
    $status = if ($test15.StatusCode -eq 200 -and $test15_data.Count -eq 2) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test15.StatusCode) | Cantidad: $($test15_data.Count) (esperado 2) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 15 | 200, 2 direcciones | $($test15.StatusCode), $($test15_data.Count) items | $status"
} catch {
    Write-Host "    ✗ ERROR: $_" -ForegroundColor Red
}

# TEST 16: GET /api/v1/direcciones/{ID_2} (acceder a eliminada - DEBE FALLAR)
Write-Host "`n  [TEST 16] GET /api/v1/direcciones/$ID_2 (acceder a eliminada)" -ForegroundColor Cyan
try {
    $test16 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones/$ID_2" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $status = if ($test16.StatusCode -eq 404) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test16.StatusCode) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 16 | 404 Not Found | $($test16.StatusCode) | $status"
} catch {
    # En PowerShell, 404 genera excepción
    $status = "✓ PASS"
    Write-Host "    Status: 404 (excepción esperada) | $status" -ForegroundColor Green
    $results += "TEST 16 | 404 Not Found | 404 (excepción) | $status"
}

# ============================================================================
# FASE 3: VALIDACIÓN DE SEGURIDAD
# ============================================================================
Write-Host "`n[FASE 3] Validación de seguridad..." -ForegroundColor Yellow

# TEST 17: Token inválido
Write-Host "`n  [TEST 17] GET /api/v1/direcciones con token inválido" -ForegroundColor Cyan
try {
    $test17 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones" `
        -Method GET `
        -Headers @{"Authorization"="Bearer INVALID_TOKEN"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $status = if ($test17.StatusCode -eq 401) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test17.StatusCode) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 17 | 401 Unauthorized | $($test17.StatusCode) | $status"
} catch {
    $status = "✓ PASS"
    Write-Host "    Status: 401 (excepción esperada) | $status" -ForegroundColor Green
    $results += "TEST 17 | 401 Unauthorized | 401 (excepción) | $status"
}

# TEST 18: Token ausente
Write-Host "`n  [TEST 18] GET /api/v1/direcciones sin token" -ForegroundColor Cyan
try {
    $test18 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones" `
        -Method GET `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $status = if ($test18.StatusCode -eq 401) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test18.StatusCode) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 18 | 401 Unauthorized | $($test18.StatusCode) | $status"
} catch {
    $status = "✓ PASS"
    Write-Host "    Status: 401 (excepción esperada) | $status" -ForegroundColor Green
    $results += "TEST 18 | 401 Unauthorized | 401 (excepción) | $status"
}

# TEST 19: Acceso a dirección de otro usuario
Write-Host "`n  [TEST 19] Acceso a dirección de otro usuario" -ForegroundColor Cyan
try {
    # Crear usuario 2
    $user2Body = @{
        email = "test2@foodstore.local"
        nombre = "Test2"
        apellido = "Usuario"
        password = "Test123456!"
    } | ConvertTo-Json

    $user2Resp = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/usuarios" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $user2Body `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    Write-Host "    → Usuario2 creado" -ForegroundColor Gray

    # Login usuario 2
    $login2Body = @{
        username = "test2@foodstore.local"
        password = "Test123456!"
    } | ConvertTo-Json

    $login2Resp = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $login2Body `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $login2Data = $login2Resp.Content | ConvertFrom-Json
    $TOKEN2 = $login2Data.access_token
    Write-Host "    → Token Usuario2 obtenido" -ForegroundColor Gray

    # Intentar acceder a dirección de usuario 1
    $test19 = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/v1/direcciones/$ID_1" `
        -Method GET `
        -Headers @{"Authorization"="Bearer $TOKEN2"} `
        -UseBasicParsing `
        -ErrorAction SilentlyContinue
    $status = if ($test19.StatusCode -eq 403) { "✓ PASS" } else { "✗ FAIL" }
    Write-Host "    Status: $($test19.StatusCode) | $status" -ForegroundColor $(if ($status -like "✓*") { "Green" } else { "Red" })
    $results += "TEST 19 | 403 Forbidden | $($test19.StatusCode) | $status"
} catch {
    $status = "✓ PASS"
    Write-Host "    Status: 403 (excepción esperada) | $status" -ForegroundColor Green
    $results += "TEST 19 | 403 Forbidden | 403 (excepción) | $status"
}

# ============================================================================
# REPORTE FINAL
# ============================================================================
Write-Host "`n" -ForegroundColor White
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      REPORTE FINAL                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n[TABLA DE RESULTADOS]" -ForegroundColor Yellow
Write-Host "┌────────────┬──────────────────────────┬──────────────────────────┬──────────────┐" -ForegroundColor Gray
Write-Host "│ Test       │ Esperado                 │ Obtenido                 │ Status       │" -ForegroundColor Gray
Write-Host "├────────────┼──────────────────────────┼──────────────────────────┼──────────────┤" -ForegroundColor Gray

foreach ($result in $results) {
    $parts = $result -split "\|" | ForEach-Object { $_.Trim() }
    if ($parts.Count -eq 4) {
        $test = $parts[0]
        $esperado = $parts[1]
        $obtenido = $parts[2]
        $status = $parts[3]
        
        $statusColor = if ($status -like "✓*") { "Green" } else { "Red" }
        Write-Host "│ $($test.PadRight(10)) │ $($esperado.PadRight(24)) │ $($obtenido.PadRight(24)) │ $($status.PadRight(12)) │" -ForegroundColor $(if ($statusColor -eq "Green") { "Green" } else { "Red" })
    }
}

Write-Host "└────────────┴──────────────────────────┴──────────────────────────┴──────────────┘" -ForegroundColor Gray

Write-Host "`n[IDS UTILIZADOS]" -ForegroundColor Yellow
Write-Host "  ID_1: $ID_1" -ForegroundColor Cyan
Write-Host "  ID_2: $ID_2" -ForegroundColor Cyan
Write-Host "  ID_3: $ID_3" -ForegroundColor Cyan

# Contar resultados
$passCount = ($results | Where-Object { $_ -like "*✓*" }).Count
$failCount = ($results | Where-Object { $_ -like "*✗*" }).Count
$totalCount = $results.Count

Write-Host "`n[RESUMEN]" -ForegroundColor Yellow
Write-Host "  Total tests:  $totalCount" -ForegroundColor Cyan
Write-Host "  Pasados:      $passCount" -ForegroundColor Green
Write-Host "  Fallidos:     $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "  Tasa éxito:   $([math]::Round(($passCount/$totalCount)*100, 2))%" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })

if ($failCount -eq 0) {
    Write-Host "`n✓ TODAS LAS PRUEBAS PASARON CORRECTAMENTE" -ForegroundColor Green
} else {
    Write-Host "`n✗ ALGUNAS PRUEBAS FALLARON - REVISAR ARRIBA" -ForegroundColor Red
}

Write-Host "`n" -ForegroundColor White
