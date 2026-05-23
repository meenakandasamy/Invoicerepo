import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Trash2, ChevronDown } from 'lucide-react';
import { Modal } from '@mui/material';
import { CustomTable } from '../table/customTable';
import { CustomsopForm } from '../form/customsopForm';
import type { JSX } from 'react';
import type { BaseProps } from '@/types/common';
import type { Row } from '@/types/table';
import type { Field } from '@/types/form';
import {
  EIRASAAS_API_QUERIES,
  EirasaasAPIs,
} from '@/integrations/Services/commonServices';
import {
  useMutationFn,
  useQueriesFn,
  useQueriesFnWithId,
} from '@/utils/common/queryUtils';
import {
  TicketSopQueries,
  TicketSopServices,
} from '@/integrations/Services/ticketSopServices';

interface TicketProps extends BaseProps {}
export const Sop = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: TicketProps): JSX.Element => {
  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const [toBackend, setToBackend] = useState<boolean>(false);
  const [ticketTypes, setTicketTypes] = useState<Array<any>>([]);
  const [ticketCategory, setTicketCategory] = useState<Array<any>>([]);
  const [dropdowndata, setDropdowndata] = useState<Array<any>>([]);
  const [ticketTypeId, setticketTypeId] = useState<number>(2);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [sections, setSections] = useState([
    {
      id: 1,
      sectionName: '',
      steps: [
        {
          id: 1,
          header: '',
          fieldTypes: [],
          previousAfter: 'No',
          options: dropdowndata,
          textCount: 1,
          remarks: '',
          selectValues: [],
        },
      ],
    },
  ]);
  console.log(sections);

  useEffect(() => {
    if (dropdowndata.length > 0) {
      setSections((prev: any) =>
        prev.map((section: any) => ({
          ...section,
          steps: section.steps.map((step: any) => ({
            ...step,
            options: dropdowndata,
          })),
        })),
      );
    }
  }, [dropdowndata]);
  const queries = [
    {
      queryKey: TicketSopQueries.GET_TICKET_SOP,
      api: TicketSopServices.fetchgetallTicketSop,
      setState: setTableValue,
      // id: session.userId,
    },
    {
      queryKey: EIRASAAS_API_QUERIES.GET_TICKET_TYPE,
      api: EirasaasAPIs.FetchTicketType,
      setState: setTicketTypes,
      id: session.userId,
    },
    {
      queryKey: EIRASAAS_API_QUERIES.GET_TICKET_CATEGORY,
      api: EirasaasAPIs.FetchTicketCategory,
      setState: setTicketCategory,
      id: ticketTypeId,
    },
  ];
  const {
    data: [dependentResponse],
    status,
  } = useQueriesFn(queries);
  const query = [
    {
      queryKey: TicketSopQueries.GET_TICKET_SOP_DROPDOWN,
      api: TicketSopServices.fetchGetallSopdropdown,
      setState: setDropdowndata,
      id: [ticketTypeId, categoryId],
    },
  ];
  useQueriesFnWithId(query);
  const postMutation = useMutationFn(
    TicketSopServices.AddNewSop,
    TicketSopQueries.GET_TICKET_SOP,
  );
  const putMutation = useMutationFn(
    TicketSopServices.UpdateSopById,
    TicketSopQueries.GET_TICKET_SOP,
  );
  const headCells = [
    {
      label: 'TicketType',
      id: 'ticketTypeName',

      view: true,
      filterable: true,
    },
    {
      label: 'Ticket Category',
      id: 'ticketCategoryName',
      view: true,
      filterable: true,
    },
    {
      label: 'Sop Name',
      id: 'sopName',
      view: true,
      filterable: true,
    },
    {
      label: 'Action',
      id: 'action',
      view: true,
      filterable: true,
    },
  ];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const defaultValues = {
    sopName: '',
    status: '',
    ticketType: '',
    ticketCategory: '',
    sopId: '',
    status: 'Active',
  };
  const clickableColumnList: Array<string> = ['documentName'];
  const [formFields, setFormFields] = useState<SopFieldType>(defaultValues);
  const fields: Array<Field> = [
    {
      name: 'ticketType',
      label: 'Ticket Type',
      type: 'select',
      placeholder: 'Enter Ticket Type',
      required: true,
      onChange: (name, value, form) => {
        form.setFieldValue(name, value);

        const selectedType = ticketTypes.find(
          (type) => type.ticketTypeName === value,
        )?.ticketTypeId;
        setticketTypeId(selectedType);
      },
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'ticketCategory',
      label: 'Ticket Category',
      type: 'select',
      // disabled: formFields.ticketType,
      placeholder: 'Enter Ticket Category',
      onChange: (name, value, form) => {
        form.setFieldValue(name, value);
        const selectedcategory = ticketCategory.find(
          (type) => type.categoryName === value,
        )?.categoryId;
        setCategoryId(selectedcategory);
      },
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'sopName',
      label: 'SOP Name',
      type: 'text',
      placeholder: 'Enter SOP Name',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'Enter Status',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
  ];
  const handleDownloadDocument = (row: any) => {
    const fileUrl = row;

    if (typeof fileUrl === 'string' && fileUrl.startsWith('http')) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.log('Invalid document URL');
    }
  };
  const formStyles = {
    pageName: 'Cost centre',
    label: 'text-mm font-bold text-black dark:text-[var(--foreground)]',
    container:
      'flex items-center justify-center min-h-screen p-4 overflow-auto max-w-screen-xl mx-auto bg-transparent dark:bg-transparent',
    form: 'w-full max-h-[100vh] border rounded-xl backdrop-blur-md  shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-y-auto',
    submitButton:
      'h-11 px-8 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition',
    cancelButton:
      'h-11 px-8 rounded-xl border border-slate-300 hover:bg-slate-50 transition',
  };

  const handleOpen = () => {
    setIsOpen(true);

    setFormFields({
      ...formFields,
    });

    setSections([
      {
        id: 1,
        sectionName: '',
        steps: [
          {
            id: 1,
            header: '',
            fieldTypes: [],
            previousAfter: 'No',
            options: [],
            textCount: 1,
            remarks: '',
            selectValues: [],
          },
        ],
      },
    ]);
  };
  const handleClose = () => {
    setIsOpen(false);
    setFormFields(defaultValues);
    setToBackend(false);
    setEdit(false);
  };
  const options = {
    status: ['Inactive', 'Active'],
    ticketType: ticketTypes.map((type) => type.ticketTypeName),
    ticketCategory: ticketCategory.map((category) => category.categoryName),
  };

  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      const mappedSections = row?.sopData?.sections?.map(
        (section: any, sectionIndex: number) => ({
          id: sectionIndex + 1,
          sectionName: section.sectionName,

          steps: section.subSteps.map((step: any, stepIndex: number) => {
            // Extract field types
            const fieldTypes = step.fields.map((field: any) => {
              switch (field.type) {
                case 'TEXT':
                  return 'TextField';

                case 'DROPDOWN':
                  return 'DropDown';

                case 'CHECKBOX':
                  return 'Checkbox';

                case 'IMAGE':
                  return 'Image';

                default:
                  return field.type;
              }
            });

            // Dropdown values
            const dropdownField = step.fields.find(
              (field: any) => field.type === 'DROPDOWN',
            );

            // Image field
            const imageField = step.fields.find(
              (field: any) => field.type === 'IMAGE',
            );

            return {
              id: stepIndex + 1,

              header: step.workDescription,

              fieldTypes,

              options: dropdowndata,

              selectValues: dropdownField?.options || [],

              previousAfter: imageField?.imageRequired ? 'Yes' : 'No',

              textCount: imageField?.imageCount || 1,

              remarks: step.remarksEnabled,
            };
          }),
        }),
      );

      console.log(mappedSections);

      setSections(mappedSections);

      const data = {
        ...row,
        ticketType:row?.ticketTypeName,
        ticketCategory:row?.ticketCategoryName
      };
setCategoryId(data?.ticketCategoryId)
setticketTypeId(data?.ticketTypeId)
      setFormFields(data);
      setIsOpen(true);
      setEdit(true);
    }
  }
  const includedDownloadColumns = headCells
    .filter((headcell) => headcell.view === true)
    .map((headcell) => headcell.id);
  function onSubmit(data: any) {
    setToBackend(true);
    const emptySection = sections.find(
      (section) => !section.sectionName?.trim(),
    );

    if (emptySection) {
      toast.error('Section name is required');
      setToBackend(false);
      return;
    }  // SUBSTEP VALIDATION
for (const section of sections) {
  for (const step of section.steps) {

    // Show error ONLY when all 3 are empty
    const isHeaderEmpty = !step.header?.trim();
    const isFieldTypeEmpty =
      !step.fieldTypes || step.fieldTypes.length === 0;
    const isImageNo = step.previousAfter === 'No';

    if (isHeaderEmpty && isFieldTypeEmpty && isImageNo) {
      toast.error(
        'Header, field type, or image configuration is required',
      );
      setToBackend(false);
      return;
    }

    // Dropdown validation
    if (
      step.fieldTypes?.includes('DropDown') &&
      (!step.selectValues || step.selectValues.length === 0)
    ) {
      toast.error('Dropdown values are required');
      setToBackend(false);
      return;
    }

    // Image count validation
    if (
      step.fieldTypes?.includes('Image') &&
      (!step.textCount || step.textCount <= 0)
    ) {
      toast.error('Image count is required');
      setToBackend(false);
      return;
    }
  }
}
    const payload = {
      sopName: data.sopName || 'Inverter Maintenance SOP',

      ticketTypeId: ticketTypes.find(
        (item) => item.ticketTypeName === data.ticketType,
      )?.ticketTypeId,

      ticketCategoryId: ticketCategory.find(
        (item) => item.categoryName === data.ticketCategory,
      )?.categoryId,

      customerId: session.customerId,
      companyId: session.companyId,
      status: 1,
      createdBy: session.userId,

      sopData: {
        sections: sections.map((section, sectionIndex) => ({
          sectionNo: sectionIndex + 1,

          sectionName: section.sectionName,

          subSteps: section.steps.map((step, stepIndex) => {
            const fields: any[] = [];

            // TEXT FIELD
            if (step.fieldTypes.includes('TextField')) {
              fields.push({
                type: 'TEXT',
              });
            }

            // DROPDOWN FIELD
            if (step.fieldTypes.includes('DropDown')) {
              fields.push({
                type: 'DROPDOWN',
                options: step.selectValues || [],
              });
            }

            // CHECKBOX FIELD
            if (step.fieldTypes.includes('Checkbox')) {
              fields.push({
                type: 'CHECKBOX',
              });
            }

            // IMAGE FIELD
            if (step.fieldTypes.includes('Image')) {
              fields.push({
                type: 'IMAGE',
                imageRequired: step.previousAfter === 'Yes',
                imageCount: step.textCount || 1,
              });
            }

            return {
              stepNo: `${sectionIndex + 1}.${stepIndex + 1}`,

              workDescription: step.header,

              fields,

              remarksEnabled: step.remarks,
            };
          }),
        })),
      },
    };
    console.log(payload);

    postMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('sop created successfully!');
        handleClose();
        setFormFields(defaultValues);
        setToBackend(false);
      },
      onError: (error: any) => {
        setToBackend(false);
        const errors = error.response.data.error;
        if (errors?.includes('unique_po_number')) {
          toast.error(
            'PO number already exists. Document already uploaded for this PO.',
          );
        } else {
          toast.error(error.message);
        }
      },
    });
  }

  function onUpdate(data: any) {
    setToBackend(true);
    const emptySection = sections.find(
      (section) => !section.sectionName?.trim(),
    );

    if (emptySection) {
      toast.error('Section name is required');
      setToBackend(false);
      return;
    }
    const payload = {
      sopName: data.sopName || 'Inverter Maintenance SOP',
      sopId: data.sopId,
      ticketTypeId: ticketTypes.find(
        (item) => item.ticketTypeName === data.ticketType,
      )?.ticketTypeId,

      ticketCategoryId: ticketCategory.find(
        (item) => item.categoryName === data.ticketCategory,
      )?.categoryId,

      customerId: session.customerId,
      companyId: session.companyId,
      status: 1,
      createdBy: session.userId,

      sopData: {
        sections: sections.map((section, sectionIndex) => ({
          sectionNo: sectionIndex + 1,

          sectionName: section.sectionName,

          subSteps: section.steps.map((step, stepIndex) => {
            const fields: any[] = [];

            // TEXT FIELD
            if (step.fieldTypes.includes('TextField')) {
              fields.push({
                type: 'TEXT',
              });
            }

            // DROPDOWN FIELD
            if (step.fieldTypes.includes('DropDown')) {
              fields.push({
                type: 'DROPDOWN',
                options: step.selectValues || [],
              });
            }

            // CHECKBOX FIELD
            if (step.fieldTypes.includes('Checkbox')) {
              fields.push({
                type: 'CHECKBOX',
              });
            }

            // IMAGE FIELD
            if (step.fieldTypes.includes('Image')) {
              fields.push({
                type: 'IMAGE',
                imageRequired: step.previousAfter === 'Yes',
                imageCount: step.textCount || 1,
              });
            }

            return {
              stepNo: `${sectionIndex + 1}.${stepIndex + 1}`,

              workDescription: step.header,

              fields,

              remarksEnabled: step.remarks,
            };
          }),
        })),
      },
    };
    console.log(payload);
    putMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('SOP updated successfully!');
        handleClose();
        setFormFields(defaultValues);
      },
      onError: (error: any) => {
        const errors = error.response.data.error;
        if (errors?.includes('unique_po_number')) {
          toast.error(
            'PO number already exists. Document already uploaded for this PO.',
          );
        } else {
          toast.error(error.message);
        }
      },
    });
  }

  // ----- TABS STATE -----
  const addSection = () => {
    setSections((prev: any) => [
      ...prev,
      {
        id: prev.length + 1,
        sectionName: '',
        steps: [
          {
            id: 1,
            header: '',
            fieldTypes: [],
            options: dropdowndata,
            previousAfter: 'No',
            remarks: '',
          },
        ],
      },
    ]);
  };

  const removeSection = (sectionId: number) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const addSubStep = (sectionId: number) => {
    setSections((prev: any) =>
      prev.map((section: any) =>
        section.id === sectionId
          ? {
              ...section,
              steps: [
                ...section.steps,
                {
                  id: section.steps.length + 1,
                  header: '',
                  fieldTypes: [],
                  options: dropdowndata,
                  previousAfter: 'No',
                  remarks: '',
                },
              ],
            }
          : section,
      ),
    );
  };

  const removeSubStep = (sectionId: number, stepId: number) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              steps: section.steps.filter((s) => s.id !== stepId),
            }
          : section,
      ),
    );
  };

  const handleSectionChange = (sectionId: number, key: string, value: any) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, [key]: value } : section,
      ),
    );
  };
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleStepChange = (
    sectionId: number,
    stepId: number,
    key: string,
    value: any,
  ) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              steps: section.steps.map((step) =>
                step.id === stepId ? { ...step, [key]: value } : step,
              ),
            }
          : section,
      ),
    );
  };
  return (
    <div className="m-2.5">
      {/* {tableValue.isLoading ||
          status.some((item) => item === 'pending') ? (
            <Loader />
          ) : ( */}
      <section className="w-full h-full flex flex-col">
        <>
          <CustomTable
            headcells={headCells}
            rows={tableValue}
            pageName={'Ticket Approval'}
            hide={{
              add: false,
              filter: false,
              hidden: false,
              download: false,
            }}
            access={{
              hasCreateAccess: true,
              hasUpdateAccess: hasUpdateAccess,
            }}
            functions={{
              addFn: handleOpen,
              optionHandler: (option: any, row: any) =>
                handleOptionClick(option, row),
            }}
            onClick={(row, headcellId) => {
              if (headcellId === 'documentName') {
                handleDownloadDocument(row.document);
              }
            }}
            clickableColumn={clickableColumnList}
            includedDownloadColumns={includedDownloadColumns}
          />
        </>
        {/* COST HEADER TAB */}
      </section>
      {/* )} */}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Modal open={isOpen} onClose={handleClose}>
            <CustomsopForm
              initialValues={formFields}
              submitFunction={(data) =>
                edit ? onUpdate(data) : onSubmit({ ...data, sections })
              }
              onClose={handleClose}
              fields={fields}
              options={options}
              styles={formStyles}
              label={'Add Standard Operating Procedure'}
              toBackend={toBackend}
              extraContent={
                <div className="space-y-6">
                  {/* ADD SECTION */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addSection}
                      className="
          h-11 px-5
          rounded-2xl
          border border-violet-200
          bg-violet-50
          text-violet-700
          font-medium
          hover:bg-violet-100
          transition
        "
                    >
                      + Add Section
                    </button>
                  </div>

                  {/* SECTION LIST */}
                  {sections.map((section, sectionIndex) => (
                    <div
                      key={section.id}
                      className="border rounded-2xl overflow-hidden bg-white shadow-sm"
                    >
                      {/* SECTION HEADER */}
                      <div className="flex items-center justify-between px-8 py-3 bg-gray-50 border-b">
                        <div className="flex items-center gap-4">
                          <h2 className="font-semibold text-violet-700 text-lg">
                            Section {sectionIndex + 1}
                          </h2>

                          <input
                            type="text"
                            value={section.sectionName}
                            onChange={(e) =>
                              handleSectionChange(
                                section.id,
                                'sectionName',
                                e.target.value,
                              )
                            }
                            placeholder="Section Name"
                            className="border rounded-lg px-4 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>

                        <Trash2
                          type="button"
                          onClick={() => removeSection(section.id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        />
                      </div>

                      {/* TABLE */}
                      <div className="overflow-auto">
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-100 text-sm">
                            <tr>
                              <th className="p-4 text-left">#</th>

                              <th className="p-4 text-left min-w-[250px]">
                                Header (Sub Step)
                              </th>

                              <th className="p-4 text-left min-w-[320px]">
                                Field Type
                              </th>

                              <th className="p-4 text-left min-w-[220px]">
                                After Image
                              </th>

                              <th className="p-4 text-left min-w-[220px]">
                                Remarks
                              </th>

                              <th className="p-4 text-left">Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {section.steps.map((step, stepIndex) => (
                              <tr key={step.id} className="border-t align-top">
                                {/* NUMBER */}
                                <td className="p-4">
                                  {sectionIndex + 1}.{stepIndex + 1}
                                </td>

                                {/* HEADER */}
                                <td className="p-3">
                                  <input
                                    type="text"
                                    value={step.header}
                                    onChange={(e) =>
                                      handleStepChange(
                                        section.id,
                                        step.id,
                                        'header',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter Header"
                                    className="border rounded-lg px-4 py-2 w-full"
                                  />
                                </td>

                                {/* FIELD TYPE */}
                                <td className="p-3">
                                  <div className="space-y-4">
                                    {/* CHECKBOXES */}
                                    <div className="grid grid-cols-2 gap-3">
                                      {[
                                        'TextField',
                                        'DropDown',
                                        'Checkbox',
                                        'Image',
                                      ].map((type) => (
                                        <label
                                          key={type}
                                          className="flex items-center gap-2 text-sm"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={step.fieldTypes.includes(
                                              type,
                                            )}
                                            onChange={(e) => {
                                              const updated = e.target.checked
                                                ? [...step.fieldTypes, type]
                                                : step.fieldTypes.filter(
                                                    (t: string) => t !== type,
                                                  );

                                              handleStepChange(
                                                section.id,
                                                step.id,
                                                'fieldTypes',
                                                updated,
                                              );
                                              if (
                                                type === 'Image' &&
                                                !e.target.checked
                                              ) {
                                                handleStepChange(
                                                  section.id,
                                                  step.id,
                                                  'previousAfter',
                                                  'No',
                                                );

                                                handleStepChange(
                                                  section.id,
                                                  step.id,
                                                  'textCount',
                                                  1,
                                                );
                                              }
                                            }}
                                          />

                                          {type}
                                        </label>
                                      ))}
                                    </div>

                                    {/* DROPDOWN OPTIONS */}
                                    {step.fieldTypes.includes('DropDown') && (
                                      <div className="border rounded-xl w-60  bg-gray-50 p-1 space-y-2">
                                        {/* CUSTOM MULTI SELECT */}
                                        <div className="relative">
                                          <details className="w-full">
                                            <summary className="list-none cursor-pointer border rounded-lg px-1 py-2 bg-white flex justify-between items-center">
                                              <span className="text-sm text-gray-700 h-4 flex items-center">
                                                {step.selectValues?.length >
                                                0 ? (
                                                  step.selectValues.length ===
                                                  1 ? (
                                                    <span className="max-w-24 truncate inline-block">
                                                      {step.selectValues[0]}
                                                    </span>
                                                  ) : (
                                                    <span className="flex items-center gap-1">
                                                      <span className="max-w-40 truncate inline-block">
                                                        {step.selectValues[0]}
                                                      </span>

                                                      <span>
                                                        +
                                                        {step.selectValues
                                                          .length - 1}
                                                      </span>
                                                    </span>
                                                  )
                                                ) : (
                                                  'Select values'
                                                )}
                                              </span>

                                              <ChevronDown
                                                size={16}
                                                className="text-gray-500"
                                                onChange={(e) => {
                                                  const selectedValues =
                                                    step.selectValues || [];

                                                  if (e.target.checked) {
                                                    handleStepChange(
                                                      section.id,
                                                      step.id,
                                                      'selectValues',
                                                      [
                                                        ...selectedValues,
                                                        option,
                                                      ],
                                                    );
                                                  } else {
                                                    handleStepChange(
                                                      section.id,
                                                      step.id,
                                                      'selectValues',
                                                      selectedValues.filter(
                                                        (item: string) =>
                                                          item !== option,
                                                      ),
                                                    );
                                                  }
                                                }}
                                              />
                                            </summary>

                                            <div className="absolute z-10  w-full bg-white border rounded-lg shadow-lg max-h-52 overflow-y-auto p-1 space-y-1">
                                              {step.options?.map(
                                                (
                                                  option: string,
                                                  index: number,
                                                ) => (
                                                  <label
                                                    key={index}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-1 py-1 rounded-md"
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      checked={(
                                                        step.selectValues || []
                                                      ).includes(option)}
                                                    />

                                                    <span>{option}</span>
                                                  </label>
                                                ),
                                              )}
                                            </div>
                                          </details>
                                        </div>

                                        {/* ADD OPTION */}
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={step.optionInput || ''}
                                            placeholder="Add option"
                                            onChange={(e) =>
                                              handleStepChange(
                                                section.id,
                                                step.id,
                                                'optionInput',
                                                e.target.value,
                                              )
                                            }
                                            className="w-40 h-8 border rounded-md px-2 text-sm"
                                          />

                                          <button
                                            type="button"
                                            className=" bg-violet-100 text-violet-700 hover:bg-violet-200  px-4 rounded-lg"
                                            onClick={() => {
                                              if (!step.optionInput) return;

                                              handleStepChange(
                                                section.id,
                                                step.id,
                                                'options',
                                                [
                                                  ...(step.options || []),
                                                  step.optionInput,
                                                ],
                                              );
                                              handleStepChange(
                                                section.id,
                                                step.id,
                                                'selectValues',
                                                [
                                                  ...(step.selectValues || []),
                                                  step.optionInput,
                                                ],
                                              );
                                              handleStepChange(
                                                section.id,
                                                step.id,
                                                'optionInput',
                                                '',
                                              );
                                            }}
                                          >
                                            Add
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                {/* AFTER IMAGE */}
                                <td className="p-3">
                                  <div className="space-y-4">
                                    <div className="flex gap-2">
                                      {['Yes', 'No'].map((option) => (
                                        <label
                                          key={option}
                                          className="flex items-center gap-2"
                                        >
                                          <input
                                            type="radio"
                                            name={`radio-${section.id}-${step.id}`}
                                            checked={
                                              step.previousAfter === option
                                            }
                                            disabled={
                                              !step.fieldTypes.includes('Image')
                                            }
                                            onChange={() =>
                                              handleStepChange(
                                                section.id,
                                                step.id,
                                                'previousAfter',
                                                option,
                                              )
                                            }
                                          />

                                          {option}
                                        </label>
                                      ))}
                                    </div>

                                    {/* TEXT COUNT */}
                                    {}
                                    {step.previousAfter === 'Yes' && (
                                      <div>
                                        <input
                                          type="number"
                                          min={1}
                                          value={step.textCount || 1}
                                          onChange={(e) => {
                                            const value = Math.min(
                                              5,
                                              Math.max(
                                                1,
                                                Number(e.target.value),
                                              ),
                                            );

                                            handleStepChange(
                                              section.id,
                                              step.id,
                                              'textCount',
                                              value,
                                            );
                                          }}
                                          className="w-24 border rounded-lg px-2 py-1"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* REMARKS */}
                                <td className="p-3">
                                  <input
                                    type="text"
                                    value={step.remarks}
                                    onChange={(e) =>
                                      handleStepChange(
                                        section.id,
                                        step.id,
                                        'remarks',
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter Remarks"
                                    className="border rounded-lg px-4 py-2 w-full"
                                  />
                                </td>

                                {/* ACTION */}
                                <td className="p-4">
                                  <Trash2
                                    type="button"
                                    onClick={() =>
                                      removeSubStep(section.id, step.id)
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* ADD SUB STEP */}
                        <div className="p-4 border-t">
                          <button
                            type="button"
                            onClick={() => addSubStep(section.id)}
                            className="text-violet-700 hover:text-violet-800 font-medium"
                          >
                            + Add Sub Step
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          </Modal>
        </div>
      )}
    </div>
  );
};
