import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Modal } from '@mui/material';
import { CustomTable } from '../table/customTable';
import { CustomsopForm } from '../form/customsopForm';
import type { JSX } from 'react';
import type { BaseProps } from '@/types/common';
import type { Row } from '@/types/table';
import type { Field } from '@/types/form';

import { useQueriesFn } from '@/utils/common/queryUtils';
import {
  TicketApprovalQueries,
  TicketApprovalServices,
} from '@/integrations/Services/ticketApprovalServices';

interface TicketProps extends BaseProps {}
export const Sop = ({
  hasCreateAccess,
  hasUpdateAccess,
  session,
}: TicketProps): JSX.Element => {
  const [tableValue, setTableValue] = useState<Array<Row>>([]);
  const [toBackend, setToBackend] = useState<boolean>(false);
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
          remarks: '',
        },
      ],
    },
  ]);
  const queries = [
    {
      queryKey: TicketApprovalQueries.GET_TICKET_APPROVAL_USERID,
      api: TicketApprovalServices.fetchgetallTicketApproval,
      setState: setTableValue,
      id: session.userId,
    },
  ];
  const {
    data: [dependentResponse],
    status,
  } = useQueriesFn(queries);

  // const postMutation = useMutationFn(
  //   PoloaServices.AddNewpoloa,
  //   PoloaQueries.GET_ALL,
  // );
  // const putMutation = useMutationFn(
  //   PoloaServices.UpdatePoloaById,
  //   PoloaQueries.GET_ALL,
  // );
  // const HeadCells = [
  //   {
  //     id: 'vendorCode',
  //     label: 'Vendor Code',
  //     view: true,
  //     filterable: true,
  //   },
  //   { id: 'action', label: 'Action', view: true, filterable: false },
  // ];
  const headCells = [
    {
      label: 'Ticket No',
      id: 'ticketCode',

      view: true,
      filterable: true,
    },
    {
      label: 'Site Name',
      id: 'siteName',
      view: true,
      filterable: true,
    },

    {
      label: 'Ticket Category',
      id: 'categoryName',
      view: true,
      filterable: false,
    },
    {
      label: 'Equipment Name',
      id: 'displayName',
      view: true,
      filterable: true,
    },

    {
      label: 'Priority',
      id: 'priority',
      view: true,
      filterable: false,
    },

    {
      label: 'Created Date',
      id: 'createdDate',
      view: true,
      filterable: false,
    },
    {
      label: 'Assigned To',
      id: 'assignedBy',
      view: true,
      filterable: true,
    },
    {
      label: 'Schedule  On',
      id: 'scheduleOn',
      view: true,
      filterable: true,
    },
    {
      label: 'State',
      id: 'stateName',
      view: true,
      filterable: true,
    },
    {
      label: 'Status',
      id: 'statusName',
      view: true,
      filterable: true,
    },
    {
      label: 'Current Level',
      id: 'currentLevel',
      headerStyle: { width: '100px' },

      view: true,
      filterable: true,
    },
    {
      label: 'Subject',
      id: 'subject',
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
    selectedVendorName: '',
    vendorName: '',
    poNumber: '',
    uploadType: '',
    castHeader: '',
    castCenter: '',
    document: '',
    poId: '',
  };
  const clickableColumnList: Array<string> = ['documentName'];
  const [formFields, setFormFields] = useState<poloaFieldType>(defaultValues);
  const fields: Array<Field> = [
    {
      name: 'ticketType',
      label: 'Ticket Type',
      type: 'text',
      placeholder: 'Enter Ticket Type',
      required: true,
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
      type: 'text',
      placeholder: 'Enter Ticket Category',
      required: true,
      styles: {
        wrapper: 'flex flex-col gap-1',
        label: 'text-sm font-medium text-gray-500',
        input:
          'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300',
      },
    },
    {
      name: 'ticketStatus',
      label: 'Status',
      type: 'text',
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
    form: 'w-full max-h-[100vh] border rounded-xl backdrop-blur-md p-5 shadow-xl flex flex-col bg-white dark:bg-[var(--background)] overflow-y-auto',
    submitButton:
      'border bg-blue-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-blue-600 hover:text-white dark:bg-[var(--primary)] dark:hover:bg-blue-500 dark:text-[var(--primary-foreground)]',
    cancelButton:
      'border bg-red-500 text-white py-1 px-2 rounded cursor-pointer hover:bg-red-600 hover:text-white dark:bg-[var(--destructive)] dark:hover:bg-red-500 dark:text-[var(--destructive-foreground)]',
  };

  const handleOpen = () => {
    setIsOpen(true);
    setFormFields({
      ...formFields,
    });
  };
  const handleClose = () => {
    setIsOpen(false);
    setFormFields(defaultValues);
    setToBackend(false);
    setEdit(false);
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
            remarks: '',
          },
        ],
      },
    ]);
  };
  const options = {
    uploadType: ['PO', 'LOA'],
  };

  function handleOptionClick(option: string, row: any) {
    if (option === 'Edit') {
      const data = {
        ...row,
      };
      setFormFields(data);
      setIsOpen(true);
      setEdit(true);
    }
  }
  const includedDownloadColumns = headCells
    .filter((headcell) => headcell.view === true)
    .map((headcell) => headcell.id);
  function onSubmit(data: any) {
    //   setToBackend(true);
    //   ((data.vendorId = vendorDropdown.find(
    //     (ven: any) => ven.vendorCode === data.vendorName,
    //   )?.vendorId),
    //     (data.costHeaderid = costHeadersDropdown.find(
    //       (head: any) => head.costHeaderName === data.castHeader,
    //     )?.costHeaderId),
    //     (data.costCentreid = costCentersDropdown.find(
    //       (head: any) => head.costCentreName === data.castCenter,
    //     )?.costCentreId),
    //     postMutation.mutate(data, {
    //       onSuccess: () => {
    //         toast.success('Cost Centre created successfully!');
    //         handleClose();
    //         setFormFields(defaultValues);
    //         setToBackend(false);
    //       },
    //       onError: (error: any) => {
    //         setToBackend(false);
    //             const errors=error.response.data.error
    //         if (errors?.includes('unique_po_number')) {
    //   toast.error('PO number already exists. Document already uploaded for this PO.');
    // }else{
    //   toast.error(error.message);
    // }
    //       },
    //     }));
  }

  function onUpdate(data: any) {
    //   ((data.vendorId = vendorDropdown.find(
    //     (ven: any) => ven.vendorCode === data.vendorName,
    //   )?.vendorId),
    //     (data.costHeaderid = costHeadersDropdown.find(
    //       (head: any) => head.costHeaderName === data.castHeader,
    //     )?.costHeaderId),
    //     (data.costCentreid = costCentersDropdown.find(
    //       (head: any) => head.costCentreName === data.castCenter,
    //     )?.costCentreId),
    //     putMutation.mutate(data, {
    //       onSuccess: () => {
    //         toast.success('Site mapped to Cost Centre successfully!');
    //         handleClose();
    //         setFormFields(defaultValues);
    //       },
    //       onError: (error: any) => {
    //         const errors=error.response.data.error
    //         if (errors?.includes('unique_po_number')) {
    //   toast.error('PO number already exists. Document already uploaded for this PO.');
    // }else{
    //   toast.error(error.message);
    // }
    //       },
    //     }));
  }

  // ----- TABS STATE -----
  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sectionName: '',
        steps: [
          {
            id: 1,
            header: '',
            fieldTypes: [],
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
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              steps: [
                ...section.steps,
                {
                  id: section.steps.length + 1,
                  header: '',
                  fieldTypes: [],
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
              label={'Add SOP'}
              toBackend={toBackend}
              extraContent={
                <div className="space-y-6">
                  {/* ADD SECTION */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addSection}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl shadow"
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
                      <div className="flex items-center justify-between px-8 py-5 bg-gray-50 border-b">
                        <div className="flex items-center gap-4">
                          <h2 className="font-semibold text-blue-600 text-lg">
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
                                <td className="p-4">
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
                                <td className="p-4">
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
                                            }}
                                          />

                                          {type}
                                        </label>
                                      ))}
                                    </div>

                                    {/* DROPDOWN OPTIONS */}
                                    {step.fieldTypes.includes('DropDown') && (
                                      <div className="border rounded-xl bg-gray-50 p-2 space-y-3">
                                        {/* SELECT */}
                                        <select
                                          value={step.selectValues}
                                          onChange={(e) =>
                                            handleStepChange(
                                              section.id,
                                              step.id,
                                              'selectValues',
                                              e.target.value,
                                            )
                                          }
                                          className="w-full border rounded-lg px-2 py-2"
                                        >
                                          <option value="">
                                            Select values
                                          </option>

                                          {step.options?.map(
                                            (option: string, index: number) => (
                                              <option
                                                key={index}
                                                value={option}
                                              >
                                                {option}
                                              </option>
                                            ),
                                          )}
                                        </select>

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
                                            className="flex-1 border rounded-lg px-3 py-2"
                                          />

                                          <button
                                            type="button"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg"
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
                                                'optionInput',
                                                '',
                                              );
                                            }}
                                          >
                                            Add
                                          </button>
                                        </div>

                                        {/* OPTION TAGS */}
                                        <div className="flex flex-wrap gap-2">
                                          {step.options?.map(
                                            (item: string, index: number) => (
                                              <div
                                                key={index}
                                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                                              >
                                                {item}

                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const filtered =
                                                      step.options.filter(
                                                        (
                                                          _: string,
                                                          i: number,
                                                        ) => i !== index,
                                                      );

                                                    handleStepChange(
                                                      section.id,
                                                      step.id,
                                                      'options',
                                                      filtered,
                                                    );
                                                  }}
                                                >
                                                  ×
                                                </button>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* AFTER IMAGE */}
                                <td className="p-4">
                                  <div className="space-y-4">
                                    {/* YES / NO */}
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
                                    <div>
                                      <input
                                        type="number"
                                        min={1}
                                        value={step.textCount || 1}
                                        onChange={(e) =>
                                          handleStepChange(
                                            section.id,
                                            step.id,
                                            'textCount',
                                            Number(e.target.value),
                                          )
                                        }
                                        className="w-24 border rounded-lg px-2 py-1"
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* REMARKS */}
                                <td className="p-2">
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
                            className="text-blue-600 hover:text-blue-800 font-medium"
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
