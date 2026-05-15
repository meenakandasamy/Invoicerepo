import { Minus, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export const ProductsViewer = ({ products, disabled }: any) => {
  const { productList, countHandler } = products;
  const buttonClass =
    'bg-transparent text-gray-500 hover:bg-gray-100 border border-gray-500 rounded-full w-7 h-7 flex items-center justify-center text-sm cursor-pointer';

  return (
    <Card className="w-full">
      <CardContent className="h-[50px] overflow-y-auto">
        {!productList || productList.length === 0 ? (
          <div className="h-[50px] flex items-center justify-center text-gray-500 opacity-50">
            No Products Selected
          </div>
        ) : (
          productList.map((product: any, index: number) => {
            const { productName, quantityCount } = product;

            return (
              <div key={index}>
                <div
                  className={
                    disabled
                      ? 'flex justify-between items-center p-3 opacity-50 cursor-not-allowed'
                      : 'flex justify-between items-center p-3'
                  }
                >
                  <p>{productName}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={disabled}
                      type="button"
                      className={buttonClass}
                      onClick={() => countHandler('minus', productName)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span>{quantityCount}</span>
                    <Button
                      disabled={disabled}
                      type="button"
                      className={buttonClass}
                      onClick={() => countHandler('plus', productName)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                {index !== productList.length - 1 && (
                  <div className="border-t border-gray-200"></div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
