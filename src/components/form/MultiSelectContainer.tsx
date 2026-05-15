import { ProductsViewer } from "./productsViewer";
interface MultiSelectWithContainer {
  fieldItem: any;
  options: Record<string, Array<string | number>>;
  disabledStyle: Record<string, string>;
  fieldProps: any; 
}

const MultiSelectWithContainer: React.FC<MultiSelectWithContainer> = ({
  fieldItem,
  options,
  disabledStyle,
  fieldProps,
}) => (
 
<div className="w-full flex flex-col lg:flex-col gap-4 px-0 py-8">

    <fieldProps.MultiSelect
      label={fieldItem.label}
      options={options[fieldItem.name]}
      styles={
        fieldItem.disabled
          ? disabledStyle
          : fieldItem.styles
      }
      selected={
        fieldItem.value! as Array<string | number>
      }
      onChange={(value: string | number | (string | number)[]) => { // Explicitly type value
        // field.handleChange for MultiSelect is expected to be called internally
        fieldItem.onChange?.(fieldItem.name, value);
      }}
      placeholder={
        fieldItem.placeholder || 'Select options'
      }
      disabled={fieldItem.disabled} // Explicitly pass disabled prop
    />
    {fieldItem.name === 'products' && fieldItem.viewer && (
      <ProductsViewer products={fieldItem.viewer} />
    )}
  </div>
);

export default MultiSelectWithContainer;