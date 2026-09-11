const fs = require('fs');
let content = fs.readFileSync('src/features/auth/components/TutorRegistrationWizard.tsx', 'utf-8');

// 1. Update TutorWizardStep
content = content.replace(
`export type TutorWizardStep =
  | 'name'
  | 'birthdate'
  | 'location'
  | 'email'
  | 'password'
  | 'relationship_type'
  | 'relationship_name'
  | 'relationship_birthdate'
  | 'accommodation'
  | 'condition'`,
`export type TutorWizardStep =
  | 'name'
  | 'birthdate'
  | 'location'
  | 'email'
  | 'password'`
);

// 2. Update handlePasswordSubmit
let h_start = content.indexOf('  const handlePasswordSubmit = (e: FormEvent) => {');
let h_end = content.indexOf('  const handleConditionSubmit = async (e: FormEvent) => {');
h_end = content.indexOf('  }', h_end + 50) + 3;

let new_handle = `  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    if (!checkPasswordCriteria(generalForm.password)) {
      setError('La contraseña no cumple con los requisitos de seguridad.')
      setSending(false)
      return
    }

    try {
      const nombreCompleto = (generalForm.nombres + ' ' + generalForm.apellidoPaterno + ' ' + generalForm.apellidoMaterno).trim().replace(/\\s+/g, ' ')
      const registerPayload = {
        nombreCompleto,
        email: generalForm.email,
        password: generalForm.password,
        rol: 'padre_tutor',
        ...(generalForm.curp ? { curp: generalForm.curp } : {}),
        fechaNacimiento: generalForm.birth_date,
        ciudad: generalForm.ciudad,
        estado: generalForm.estado,
        ...(generalForm.pais ? { pais: generalForm.pais } : {}),
        ...(generalForm.codigoPostal ? { codigoPostal: generalForm.codigoPostal } : {}),
      }

      const regRes = await api.post('/autenticacion/registro', registerPayload)
      const authResult = regRes.data

      if (authResult?.requiereInicioSesion) {
         addToast('Registro exitoso. Inicia sesión para continuar.', 'success')
         nav('/auth?mode=login', { replace: true })
         return
      }

      if (!authResult || !authResult.tokenAcceso) throw new Error('No se pudo completar el registro.')

      const userObj = {
        id: String(authResult.usuario?.id ?? ''),
        email: authResult.usuario?.email || generalForm.email,
        role: 'tutor',
        full_name: nombreCompleto,
      }
      setRememberMe(true)
      setAuth(authResult.tokenAcceso, userObj, authResult.tokenRefresco ?? null, true)
      saveUser(userObj, true)
      
      addToast('¡Cuenta creada exitosamente!', 'success')
      nav('/dashboard', { replace: true })
    } catch (err: any) {
       const msg = err.response?.data?.message || err.response?.data?.mensaje || 'Error al registrar.'
       setError(msg)
       addToast(msg, 'error')
    } finally {
       setSending(false)
    }
  }`;

content = content.substring(0, h_start) + new_handle + content.substring(h_end);

// 3. Update the NavButtons in password step
content = content.replace(
`          <NavButtons onBack={() => { setWizardStep('email'); scrollTop() }} submitLabel="Continuar" />
        </form>
      )}`,
`          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="auth-btn-secondary" type="button" onClick={() => { setWizardStep('email'); scrollTop() }} style={{ flex: 1 }} disabled={sending}>
              {Icons.arrowLeft({ s: 16 })} Volver
            </button>
            <button className="auth-btn-primary" type="submit" style={{ flex: 2 }} disabled={sending}>
              {sending ? 'Creando cuenta...' : 'Crear cuenta'} {Icons.checkCircle({ s: 18 })}
            </button>
          </div>
        </form>
      )}`
);

// 4. Remove all the extra steps from JSX
let j_start = content.indexOf('      {/* ═══════════════════════════════════════════════════════════\n           STEP 6: RELACIÓN / ¿Para quién es el perfil?');
if (j_start === -1) j_start = content.indexOf('      {/* ═══════════════════════════════════════════════════════════\r\n           STEP 6: RELACIÓN / ¿Para quién es el perfil?');
let j_end = content.indexOf('    </div>\n  )\n}');
if (j_end === -1) j_end = content.indexOf('    </div>\r\n  )\r\n}');

content = content.substring(0, j_start) + '\n' + content.substring(j_end);

fs.writeFileSync('src/features/auth/components/TutorRegistrationWizard.tsx', content);
console.log('Done!');
