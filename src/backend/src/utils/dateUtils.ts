import { format, parseISO, getUnixTime, fromUnixTime } from "date-fns";

export const yyyyMmToEpoch = (yyyyMm: string): number => {
  
  if (!yyyyMm || typeof yyyyMm !== 'string') {
    throw new Error("Invalid input: Expected string in YYYY-MM format");
  }
  
  if (!yyyyMm.match(/^\d{4}-\d{2}$/)) {
    throw new Error("Invalid date format. Expected YYYY-MM");
  }

  try {
    // Parse as first day of the month
    const dateString = `${yyyyMm}-01`;
    
    const date = parseISO(dateString);
    
    const epoch = getUnixTime(date);
    
    return epoch;
  } catch (error) {
    throw new Error(`Failed to convert ${yyyyMm} to epoch: ${error?.toString()}`);
  }
};

export const epochToYyyyMm = (epoch: number): string => {
  
  if (typeof epoch !== 'number' || isNaN(epoch)) {
    throw new Error("Invalid input: Expected number (Unix timestamp)");
  }
  
  try {
    const date = fromUnixTime(epoch);
    
    const result = format(date, "yyyy-MM");
    
    return result;
  } catch (error) {
    throw new Error(`Failed to convert epoch ${epoch} to YYYY-MM: ${error?.toString()}`);
  }
};

export const yyyyMmToReadable = (yyyyMm: string): string => {
  if (!yyyyMm) return "";

  try {
    const date = parseISO(`${yyyyMm}-01`);
    return format(date, "MMMM yyyy");
  } catch (error) {
    return yyyyMm; // Return original if formatting fails
  }
};

export const epochToReadable = (epoch: number): string => {
  if (typeof epoch !== 'number' || isNaN(epoch)) {
    return "Invalid date";
  }
  
  try {
    const date = fromUnixTime(epoch);
    return format(date, "MMMM yyyy");
  } catch (error) {
    return "Invalid date";
  }
};

export const isValidYyyyMm = (yyyyMm: string): boolean => {
  if (!yyyyMm || typeof yyyyMm !== 'string') return false;

  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(yyyyMm)) return false;

  const [year, month] = yyyyMm.split("-").map(Number);
  if (
    typeof year !== "number" ||
    typeof month !== "number" ||
    isNaN(year) ||
    isNaN(month)
  ) {
    return false;
  }
  return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
};