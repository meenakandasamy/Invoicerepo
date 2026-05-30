import { createFormHook } from '@tanstack/react-form';
import { fieldContext, formContext } from './app.form-context';
import { TextField } from '@/components/form/textField';
import {Customtogglebutton} from '@/components/form/customtogglebutton'
import { SelectField } from '@/components/form/selectField';
import { TextArea } from '@/components/form/textArea';
import { DatePicker } from '@/components/form/DateRanger';
import { TimePicker} from '@/components/form/customTimepicker';
import { buttonField } from '@/components/form/button';
import { Toaster } from '@/components/form/toast';
import {MultiFiledocument} from '@/components/form/multiFile'
import { MultiSelect } from '@/components/form/multiSelect';
import MultiPdfUploader from '@/components/form/fileUploader';
import { RoleInitializer } from '@/components/form/RoleInitializer';
import {ToggleButtonField} from '@/components/form/togglebutton'
import { MultiItemsField } from '@/components/form/MultiItemsField';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    SelectField,
    TextArea,
    Customtogglebutton,
    DatePicker,TimePicker,
    MultiSelect,
    MultiFiledocument,
    MultiPdfUploader,
    Toaster,
    RoleInitializer,
    MultiItemsField,
    Switch,
    Checkbox
  },
  formComponents: {
    buttonField,
  },
  fieldContext,
  formContext,
});
