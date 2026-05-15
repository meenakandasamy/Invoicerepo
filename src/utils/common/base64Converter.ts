export const base64FromFiles = async (
  files: Array<File>,
): Promise<Array<{ file: File; base64: string }>> => {
  const base64Files = await Promise.all(
    files.map((file) => {
      return new Promise<{ file: File; base64: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Format = result.split(',')[1];
          resolve({
            file,
            base64: base64Format,
          });
        };
        reader.onerror = () => {
          reject(new Error(`Failed to read file: ${file.name}`));
        };
        reader.readAsDataURL(file);
      });
    }),
  );
  return base64Files;
};
