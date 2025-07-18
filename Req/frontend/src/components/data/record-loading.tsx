export function RecordLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando registro...</span>
      </div>
    </div>
  );
}
