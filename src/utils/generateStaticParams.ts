import { patientApi } from "@/utils/api";

type Patient = {
  uuid: string;
};

type PatientListResponse = {
  data: Patient[];
  status?: string;
  message?: string;
};

export async function generateStaticParams() {
  try {
    const response = await patientApi.getAll();
    const patients = (response as PatientListResponse).data || [];
    return patients.map((patient) => ({
      uuid: patient.uuid,
    }));
  } catch (error) {
    console.error("Error generating patient static params:", error);
    return [];
  }
}

export async function generateSlugStaticParams() {
  try {
    const response = await patientApi.getAll();
    const patients = (response as PatientListResponse).data || [];
    return patients.map((patient) => ({
      slug: patient.uuid,
    }));
  } catch (error) {
    console.error("Error generating patient slug static params:", error);
    return [];
  }
}