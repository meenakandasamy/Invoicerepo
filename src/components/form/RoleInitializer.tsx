import { useStore } from 'zustand';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { useFieldContext } from '@/hooks/app.form-context';

export const RoleInitializer = ({ fieldItem, activities, onClick }: any) => {
  const field = useFieldContext<string>();
  // const errors = useStore(field.store, (state) => state.meta.errors);
  // console.log(field.state.value, 'fieldItemfield', checkedState);
  return (
    <Card className="p-0 w-[43vw]">
      <CardHeader className="p-1 bg-gray-100 flex items-center pb-0">
        <CardTitle className="p-2 ml-5">{activities[0]}</CardTitle>
        <div className="ml-auto flex gap-5 mr-3">
          {activities.slice(-3).map((header: string) => {
            const allSelected = fieldItem.activityArr.every(
              (activity: string) =>
                field.state.value?.[activity]?.[header.toLowerCase()] === 1,
            );

            return (
              <div key={header} className="p-1 gap-3 flex cursor-pointer">
                <CardAction className="w-5 h-5">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => onClick('All', header)}
                    className="w-5 h-5 bg-white border border-gray-500 cursor-pointer"
                  />
                </CardAction>
                <CardTitle>{header}</CardTitle>
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="p-2 mt-0 pt-0">
        {fieldItem.activityArr.map((activity: string, index: number) => (
          <div key={activity} className="flex items-center">
            <div className="mb-1 p-1 ml-3">
              <label className="text-sm font-medium text-gray-500 p-2">
                {activity}
              </label>
            </div>
            <div className="ml-auto flex gap-20 mr-8">
              {activities.slice(-3).map((header: string) => {
                console.log(
                  header,
                  index,
                  field.state.value,
                  // field.state.value[activity][header],
                  'fieldItemfield',
                );

                return (
                  <>
                    <div className="p-1 gap-3 flex">
                      <CardAction>
                        <Checkbox
                          key={header}
                          className="w-5 h-5 bg-white border border-gray-500 cursor-pointer"
                          checked={
                            field.state.value[activity]?.[
                              header.toLowerCase()
                            ] === 1
                          }
                          onCheckedChange={() =>
                            onClick(activity, header, index)
                          }
                        />
                      </CardAction>
                    </div>
                  </>
                );
              })}
            </div>
            {/* {index !== fieldItem.activityArr.length - 1 && <hr />} */}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
