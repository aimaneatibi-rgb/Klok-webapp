// Centrale definitie van "werknemer-profiel compleet". Wordt gebruikt door alle
// hard-gates die een actie blokkeren tot het profiel klaar is (reageren op shift,
// solliciteren op vacature). Eén plek aanpassen = overal consistent.

export type EmployeeProfileInput = {
  user: { first_name: string | null; phone: string | null } | null;
  employee: {
    date_of_birth: string | null;
    sectors: string[] | null;
  } | null;
};

export type ProfileCompletenessResult = {
  complete: boolean;
  missing: string[]; // labels van ontbrekende velden, voor UI-weergave
};

export function checkEmployeeProfile(
  input: EmployeeProfileInput
): ProfileCompletenessResult {
  const missing: string[] = [];
  if (!input.user?.first_name) missing.push("voornaam");
  if (!input.user?.phone) missing.push("telefoonnummer");
  if (!input.employee?.date_of_birth) missing.push("geboortedatum");
  if (
    !input.employee?.sectors ||
    (Array.isArray(input.employee.sectors) && input.employee.sectors.length === 0)
  ) {
    missing.push("sectoren");
  }
  return { complete: missing.length === 0, missing };
}
