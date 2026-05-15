import ICE_Logo from '../../assets/images/ICE_Logo.png';
import { validationSchema } from '../form/validations';
import { useAppForm } from '@/hooks/app.form';
import { useResetFormStore } from '@/stores/resetFormStore';

export function CustomExpenseForm({
  initialValues,
  fields,
  submitFunction,
  options,
  isValidForm = true,
  toBackend = false,
}: {
  initialValues: any;
  fields: Array<any>;
  options: Record<string, Array<string | number>>;
  submitFunction: (data: any) => void;
  isValidForm: boolean;
  toBackend?: boolean;
}) {
  const form = useAppForm({
    defaultValues: initialValues,
    onSubmit: ({ value }) => {
      submitFunction(value);
    },
  });

  const disabledStyle = {
    wrapper: 'flex flex-col gap-1',
    label: 'text-sm font-medium text-gray-500',
    input:
      'w-full h-9 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-400 select-none cursor-not-allowed',
  };

  const { setResetForm } = useResetFormStore();

  return (
    <div className="flex justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        onReset={(e) => {
          e.preventDefault();
          form.reset();
        }}
      >
        <div className="min-h-[90dvh] flex flex-col gap-3">
          <div className="flex justify-center items-center">
            <img
              src={ICE_Logo}
              alt="ICE_Logo"
              style={{ width: '600px', borderRadius: '20px' }}
            />
          </div>
          {isValidForm ? (
            <>
              <div
                style={{
                  borderRadius: '16px',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '10px',
                    backgroundColor: '#80BFA8',
                  }}
                />
                <div
                  style={{
                    padding: '1rem',
                    paddingBottom: '-10px',
                  }}
                ></div>
                <p className="text-2xl p-2 pl-5 pt-0">Expense Form</p>
                <hr />
                <p className="text-sm p-3 pl-5">
                  All information provided in this form is confidential and
                  <br />
                  and will be kept strictly confidential, not shared with any
                  third parties.
                </p>

                <hr />
                <p className="p-3 text-red-500 pl-5">
                  * Indicates required question
                </p>
              </div>
              {fields.map((field: any) => (
                <div key={field.name}>
                  <form.AppField
                    name={field.name}
                    validators={validationSchema(field)}
                  >
                    {(fieldProps) => (
                      <div className="p-4 bg-white rounded-2xl">
                        {field.type === 'select' ? (
                          <fieldProps.SelectField
                            label={field.label}
                            values={options[field.name]}
                            placeholder={field.placeholder}
                            styles={
                              field.disabled ? disabledStyle : field.styles
                            }
                            onChange={(name: string, value: any) => {
                              field.onChange?.(name, value, form);
                              form.setFieldValue(name, value);
                            }}
                            disabled={field.disabled}
                            required={field.required}
                          />
                        ) : field.type === 'file' ? (
                          <fieldProps.MultiPdfUploader
                            fieldName={field.name}
                            label={field.label}
                            styles={field.styles}
                            value={field.value}
                            type={field.type}
                            onChange={(name: string, value: any,) => {
                              field.onChange?.(name, value, form);
                              form.setFieldValue(name, value[0].base64);
                            }}
                            placeholder={field.placeholder || 'Choose File'}
                            required={field.required}
                            disabled={field.disabled}
                            acceptTypes={field.acceptTypes}
                          />
                        ) : field.type === 'date' ?
                          <fieldProps.DatePicker
                            label={field.label}
                            styles={
                              field.disabled
                                ? disabledStyle
                                : field.styles
                            }
                            onChange={(_name: string, date: Date) => {
                              field.onChange?.(field.name, date, form);
                              form.setFieldValue(field.name, date,);
                            }}
                            disabled={field.disabled}
                            required={field.required}
                          />
                          : (
                            <fieldProps.TextField
                              label={field.label}
                              styles={field.styles}
                              required={field.required}
                              placeholder={field.placeholder}
                              onChange={(name: string, value: any) => {
                                field.onChange?.(name, value, form);
                                form.setFieldValue(name, value);
                              }}
                              disabled={field.disabled}
                            />
                          )}
                      </div>
                    )}
                  </form.AppField>
                </div>
              ))}
              <form.AppForm>
                <div className="flex justify-end gap-4 p-4">
                  <form.buttonField
                    toBackend={toBackend}
                    label="Submit Form"
                    buttonType="submit"
                    className="bg-[#80BFA8] text-white py-2 px-4 rounded cursor-pointer"
                  />
                  <form.buttonField
                    label="Clear Form"
                    buttonType="reset"
                    className="bg-[#ff0000] text-white py-2 px-4 rounded cursor-pointer"
                    onClick={() => {
                      form.reset();
                      setResetForm(true);
                    }}
                  />
                </div>
              </form.AppForm>
            </> // Show invalid form card
          ) : (
            <div className="bg-white shadow-md rounded-lg p-8 w-full text-center mt-6">
              <h2 className="text-2xl font-bold text-red-500 mb-4">
                Invalid Form Request
              </h2>
              <p className="text-gray-600">
                The link you followed is either broken or no longer available.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
