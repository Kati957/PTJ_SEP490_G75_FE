import React, { useRef, useMemo, useCallback } from "react";
import type { JobPostData } from "../../../../pages/employer/PostJobPage";
import JoditEditor from "jodit-react";
import "jodit/es2021/jodit.min.css";
import debounce from 'lodash.debounce';

interface Props {
  data: JobPostData;
  onDataChange: (field: keyof JobPostData, value: any) => void;
}

const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <div className="grid grid-cols-3 gap-4 mb-4 items-start">
    <label className="text-sm font-medium text-gray-700 text-left pt-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="col-span-2">{children}</div>
  </div>
);

export const JobBenefitsFormSection: React.FC<Props> = ({
  data,
  onDataChange,
}) => {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Liệt kê các phúc lợi",
      height: 200,
      showPoweredBy: false,
      toolbarAdaptive: false,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "alignleft",
        "aligncenter",
        "alignright",
        "|",
        "undo",
        "redo",
        "|",
        "find",
      ],
    }),
    []
  );

  const handleEditorChange = useCallback(
      debounce((content: string) => {
        onDataChange('jobBenefits', content);
      }, 500),
      []
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-blue-700 mb-6">Phúc lợi</h3>

      <FormField label="Phúc lợi">
        <JoditEditor
          ref={editor}
          value={data.jobBenefits}
          config={config}
          onChange={handleEditorChange}
        />
      </FormField>
    </div>
  );
};
