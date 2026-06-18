import { IcmFormValues } from "./form-schema";
import { IcmResult } from "./types";

const STORAGE_KEY = "icm-calculator:last-result";

export interface StoredIcmCalculation {
  formValues: IcmFormValues;
  result: IcmResult;
  savedAt: string;
}

export function saveIcmCalculation(
  formValues: IcmFormValues,
  result: IcmResult,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const data: StoredIcmCalculation = {
    formValues,
    result,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

export function loadIcmCalculation():
  | StoredIcmCalculation
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawData = localStorage.getItem(STORAGE_KEY);

  if (!rawData) {
    return null;
  }

  try {
    return JSON.parse(
      rawData,
    ) as StoredIcmCalculation;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearIcmCalculation(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}