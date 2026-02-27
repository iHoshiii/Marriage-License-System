export const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return 0;
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age : 0;
};

/**
 * Splits a full name into First, Middle and Last components.
 * Returns empty strings for missing parts.
 */
export const splitName = (fullName: string | null | undefined) => {
    if (!fullName) return { first: "", middle: "", last: "" };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return { first: "", middle: "", last: "" };
    if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
    if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
    return {
        first: parts[0],
        middle: parts.slice(1, -1).join(" "),
        last: parts[parts.length - 1]
    };
};
