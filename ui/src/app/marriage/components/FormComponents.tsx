import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, GraduationCap } from "lucide-react";
import React from "react";

interface FieldProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

export function Field({ label, children, className }: FieldProps) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-tight">{label}</label>
            {children}
        </div>
    );
}

interface LabelWithIconProps {
    icon: React.ReactNode;
    text: string;
}

export function LabelWithIcon({ icon, text }: LabelWithIconProps) {
    return (
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {icon} {text}
        </div>
    );
}

interface FamilySubSectionProps {
    prefix: 'g' | 'b';
    person: string;
    data: any;
    setData: (data: any) => void;
    toTitleCase: (str: string) => string;
}

export function FamilySubSection({ prefix, person, data, setData, toTitleCase }: FamilySubSectionProps) {
    // Logic to check if Mother's Last Name matches Father's Last Name
    const isSameLastName =
        data[`${prefix}FathL`].trim() !== "" &&
        data[`${prefix}MothL`].trim() !== "" &&
        data[`${prefix}FathL`].toLowerCase() === data[`${prefix}MothL`].toLowerCase();

    return (
        <div className="space-y-6 pt-6 border-t border-slate-100">
            {/* Father Section */}
            <div>
                <LabelWithIcon icon={<GraduationCap className="w-3 h-3" />} text={`${person}'s Father`} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <Input placeholder="First Name" className="bg-white" value={data[`${prefix}FathF`]} onChange={e => setData({ ...data, [`${prefix}FathF`]: toTitleCase(e.target.value) })} />
                    <Input placeholder="Middle Name" className="bg-white" value={data[`${prefix}FathM`]} onChange={e => setData({ ...data, [`${prefix}FathM`]: toTitleCase(e.target.value) })} />
                    <Input placeholder="Last Name" className="bg-white" value={data[`${prefix}FathL`]} onChange={e => setData({ ...data, [`${prefix}FathL`]: toTitleCase(e.target.value) })} />
                </div>
            </div>

            {/* Mother Section */}
            <div>
                <div className="flex justify-between items-center">
                    <LabelWithIcon icon={<GraduationCap className="w-3 h-3" />} text={`${person}'s Mother`} />
                    <span className="text-[9px] font-bold text-rose-500 italic bg-rose-50 px-2 py-0.5 rounded-full">MAIDEN NAME REQUIRED</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <Input placeholder="First Name" className="bg-white" value={data[`${prefix}MothF`]} onChange={e => setData({ ...data, [`${prefix}MothF`]: toTitleCase(e.target.value) })} />
                    <Input placeholder="Middle Name" className="bg-white" value={data[`${prefix}MothM`]} onChange={e => setData({ ...data, [`${prefix}MothM`]: toTitleCase(e.target.value) })} />
                    <Input
                        placeholder="Maiden Last Name"
                        className={`bg-white transition-colors ${isSameLastName ? 'border-orange-400 ring-2 ring-orange-100' : ''}`}
                        value={data[`${prefix}MothL`]}
                        onChange={e => setData({ ...data, [`${prefix}MothL`]: toTitleCase(e.target.value) })}
                    />
                </div>

                {/* Visual Notification */}
                <AnimatePresence>
                    {isSameLastName && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[11px] text-orange-600 font-medium mt-2 flex items-center gap-1 bg-orange-50 p-2 rounded-lg border border-orange-100"
                        >
                            <span className="text-base">⚠️</span>
                            Please enter the Mother's <strong>Maiden Name</strong> (her last name before marriage), not her married name.
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

interface GiverSubSectionProps {
    prefix: 'g' | 'b';
    age: number;
    data: any;
    setData: (data: any) => void;
    toTitleCase: (str: string) => string; // Ensure this line is present
}

export function GiverSubSection({ prefix, age, data, setData, toTitleCase }: GiverSubSectionProps) {
    if (!age || age < 18 || age > 24) return null;
    const label = age <= 20 ? "CONSENT" : "ADVICE";

    // 1. Check if Parent Names are actually filled out in the section above
    const hasFatherName = data[`${prefix}FathF`]?.trim() !== "" && data[`${prefix}FathL`]?.trim() !== "";
    const hasMotherName = data[`${prefix}MothF`]?.trim() || data[`${prefix}MothL`]?.trim() !== "";

    const selectedRelation = data[`${prefix}GiverRelation`] || "";

    // 2. Logic: If they chose "Father" but Father name is empty OR "Mother" but Mother name is empty
    const showMissingParentWarning = 
        (selectedRelation === "Father" && !hasFatherName) || 
        (selectedRelation === "Mother" && !hasMotherName);

    const handleRelationshipChange = (val: string) => {
        let newData = { ...data, [`${prefix}GiverRelation`]: val };

        if (val === "Father" && hasFatherName) {
            newData[`${prefix}GiverF`] = data[`${prefix}FathF`];
            newData[`${prefix}GiverM`] = data[`${prefix}FathM`];
            newData[`${prefix}GiverL`] = data[`${prefix}FathL`];
        } else if (val === "Mother" && hasMotherName) {
            newData[`${prefix}GiverF`] = data[`${prefix}MothF`];
            newData[`${prefix}GiverM`] = data[`${prefix}MothM`];
            newData[`${prefix}GiverL`] = data[`${prefix}MothL`];
        } else {
            // Clear fields if switching to "Other" or if the Parent info is missing
            newData[`${prefix}GiverF`] = "";
            newData[`${prefix}GiverM`] = "";
            newData[`${prefix}GiverL`] = "";
        }
        setData(newData);
    };

    return (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-slate-100">
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                <LabelWithIcon icon={<FileText className="w-3 h-3 text-primary" />} text={`PERSON GIVING ${label}`} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Relationship">
                        <select 
                            className={`flex h-10 w-full rounded-md border ${showMissingParentWarning ? 'border-rose-500 ring-2 ring-rose-100' : 'border-input'} bg-white px-3 py-2 text-sm focus:outline-none`}
                            value={selectedRelation}
                            onChange={(e) => handleRelationshipChange(e.target.value)}
                        >
                            <option value="">Select Relationship</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Other">Other (Specify)</option>
                        </select>
                    </Field>

                    <AnimatePresence>
                        {selectedRelation === "Other" && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                <Field label="Specify Relationship">
                                    <Input 
                                        placeholder="e.g. Grandmother" 
                                        value={data[`${prefix}GiverOtherTitle`] || ""} 
                                        onChange={e => setData({ ...data, [`${prefix}GiverOtherTitle`]: toTitleCase(e.target.value) })} 
                                    />
                                </Field>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* THE WARNING MESSAGE */}
                <AnimatePresence>
                    {showMissingParentWarning && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700 text-[11px] font-bold"
                        >
                            <span className="text-base">⚠️</span>
                            PLEASE FILL UP THE {selectedRelation.toUpperCase()}'S NAME IN THE PARENTS SECTION ABOVE FIRST.
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Field label="First Name">
                        <Input 
                            placeholder="First Name" 
                            disabled={selectedRelation === "Father" || selectedRelation === "Mother"}
                            value={data[`${prefix}GiverF`] || ""} 
                            onChange={e => setData({ ...data, [`${prefix}GiverF`]: toTitleCase(e.target.value) })} 
                        />
                    </Field>
                    <Field label="Middle Name">
                        <Input 
                            placeholder="Middle Name" 
                            disabled={selectedRelation === "Father" || selectedRelation === "Mother"}
                            value={data[`${prefix}GiverM`] || ""} 
                            onChange={e => setData({ ...data, [`${prefix}GiverM`]: toTitleCase(e.target.value) })} 
                        />
                    </Field>
                    <Field label="Last Name">
                        <Input 
                            placeholder="Last Name" 
                            disabled={selectedRelation === "Father" || selectedRelation === "Mother"}
                            value={data[`${prefix}GiverL`] || ""} 
                            onChange={e => setData({ ...data, [`${prefix}GiverL`]: toTitleCase(e.target.value) })} 
                        />
                    </Field>
                </div>
            </div>
        </motion.div>
    );
}