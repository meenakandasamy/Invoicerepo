export interface ItemField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiSelect' | 'date' | 'currency'|'toggle'| 'checkbox';
  placeholder?: string;
  referValue?: string;
  default?: any;
  styles?: Record<string, any>;
  disabled?: boolean;
  onChange?: (name: string, value: any, form: any, editingField?: any) => void;
}

export type Field = {
  name: string;
  label: string;
  type: string;
  itemFields?: Array<ItemField>;
  placeholder?: string;
  value?: string | Array<string | number>;
  disabled?: boolean;
  ButtonDisabled?: boolean;
  viewer?: any;
  defaultValue?: string;
  futureDate?: boolean;
  onChange?: (
    name: string,
    value: any,
    form?: any,
    editingField?: any,
    removedItem?: any,
  ) => void;
  activityArr?: Array<string>;
  required?: boolean;
  acceptTypes?: string;
  styles?: {
    label?: string;
    input?: string;
    wrapper?: string;
    checkboxLabel?: string;
    checkbox?: string;
    button?: string;
  };
  hidden?: boolean;
  required?: boolean;
  defaultTab?: string;
  listOfTabs?: Array<string>;
  handleTabFn?: (tab: string, form: any) => void;
};

type SubmitButtonProps = {
  label: string;
  className: string;
  buttonType?: 'submit' | 'button' | 'reset';
};

interface formStylesType {
  [key: string]: string;
}
