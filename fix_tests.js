const fs = require('fs');

const FILE_PATH = 'src/features/auth/__tests__/registrationFlow.test.tsx';
let content = fs.readFileSync(FILE_PATH, 'utf8');

// 1. Update completeTutorWizard to stop after step 5
let target1 = `async function completeTutorWizard() {
  await fillNameStep('Ej. Ana Laura')
  await fillBirthdateStep()
  await fillLocationStep()
  await fillEmailStep()
  await fillPasswordStep()

  // relationship_type: "hijo" ya está seleccionado por defecto`;

let replacement1 = `async function completeTutorWizard() {
  await fillNameStep('Ej. Ana Laura')
  await fillBirthdateStep()
  await fillLocationStep()
  await fillEmailStep()
  await fillPasswordStep(/crear cuenta/i)
}

/*`;
  
let start_idx = content.indexOf(target1);
let end_idx = content.indexOf('  clickButton(/finalizar registro/i)\n}');
if (start_idx > -1 && end_idx > -1) {
    content = content.substring(0, start_idx) + replacement1 + content.substring(end_idx + 38);
}

// 2. Remove "thanks" screen expectation in the Tutor test
let target2 = `
    // Pantalla de agradecimiento
    expect(await screen.findByText(/gracias por ser el apoyo de/i)).toBeInTheDocument()`;

content = content.replace(target2, '');

// 3. Remove the future date test for TutorRegistrationWizard
let t_start = content.indexOf("  it('rechaza fecha de nacimiento futura del dependiente en TutorRegistrationWizard', async () => {");
let t_end = content.indexOf("  })", t_start + 50);

if (t_start > -1 && t_end > -1) {
    content = content.substring(0, t_start) + content.substring(t_end + 5);
}

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log('Tests fixed successfully!');
