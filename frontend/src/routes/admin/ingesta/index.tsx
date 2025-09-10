import { component$, useSignal, $ } from "@builder.io/qwik";
import { routeAction$, Form } from "@builder.io/qwik-city";
import { MainLayout } from "../../../components/layout/MainLayout";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardContent } from "../../../components/ui/Card";
import type { DocumentHead } from "@builder.io/qwik-city";

// Estado para el archivo seleccionado
const useFileState = () => {
  const selectedFile = useSignal<File | null>(null);
  const isUploading = useSignal(false);
  const uploadResult = useSignal<any>(null);
  const error = useSignal<string | null>(null);

  return {
    selectedFile,
    isUploading,
    uploadResult,
    error,
  };
};

// Acción para subir archivo
export const useUploadFile = routeAction$(async (form, requestEvent) => {
  try {
    const formData = await requestEvent.parseBody() as FormData;
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        error: 'No se seleccionó ningún archivo',
      };
    }

    // Create FormData for API call
    const apiFormData = new FormData();
    apiFormData.append('file', file);

    // Get API URL from environment
    const apiUrl = process.env.VITE_API_URL || 'http://localhost:3001/api';
    
    // Call backend API
    const response = await fetch(`${apiUrl}/turnos/excel`, {
      method: 'POST',
      body: apiFormData,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Error al procesar el archivo',
      };
    }

    return {
      success: true,
      result: result.details,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor',
    };
  }
});

export default component$(() => {
  const fileState = useFileState();
  const uploadAction = useUploadFile();

  const handleFileChange = $((event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      // Validar tipo de archivo
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        fileState.error.value = 'Solo se permiten archivos Excel (.xlsx)';
        fileState.selectedFile.value = null;
        return;
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        fileState.error.value = 'El archivo es demasiado grande (máximo 5MB)';
        fileState.selectedFile.value = null;
        return;
      }

      fileState.selectedFile.value = file;
      fileState.error.value = null;
    }
  });

  return (
    <MainLayout>
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Cargar Turnos desde Excel</h1>
          <p class="text-gray-600">
            Sube un archivo Excel para cargar o actualizar turnos en el sistema.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de subida */}
          <Card>
            <CardHeader>
              <h2 class="text-xl font-semibold text-gray-900">Seleccionar Archivo</h2>
            </CardHeader>
            <CardContent>
              <Form action={uploadAction} onSubmit$={() => {
                fileState.isUploading.value = true;
                fileState.error.value = null;
              }}>
                <div class="space-y-4">
                  <div>
                    <label
                      htmlFor="file-upload"
                      class="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Archivo Excel (.xlsx)
                    </label>
                    <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div class="space-y-1 text-center">
                        <svg
                          class="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        <div class="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Seleccionar archivo</span>
                            <input
                              id="file-upload"
                              name="file"
                              type="file"
                              accept=".xlsx"
                              class="sr-only"
                              onChange$={handleFileChange}
                            />
                          </label>
                          <p class="pl-1">o arrastrar y soltar</p>
                        </div>
                        <p class="text-xs text-gray-500">XLSX hasta 5MB</p>
                      </div>
                    </div>
                  </div>

                  {fileState.selectedFile.value && (
                    <div class="bg-green-50 border border-green-200 rounded-md p-3">
                      <div class="flex">
                        <div class="flex-shrink-0">
                          <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 011.414 0l4-4z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium text-green-800">
                            Archivo seleccionado: {fileState.selectedFile.value.name}
                          </p>
                          <p class="text-sm text-green-700">
                            Tamaño: {(fileState.selectedFile.value.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {fileState.error.value && (
                    <div class="bg-red-50 border border-red-200 rounded-md p-3">
                      <div class="flex">
                        <div class="flex-shrink-0">
                          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium text-red-800">Error</p>
                          <p class="text-sm text-red-700">{fileState.error.value}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    loading={fileState.isUploading.value}
                    disabled={!fileState.selectedFile.value || fileState.isUploading.value}
                  >
                    {fileState.isUploading.value ? 'Procesando...' : 'Subir y Procesar'}
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>

          {/* Resultado de la subida */}
          <Card>
            <CardHeader>
              <h2 class="text-xl font-semibold text-gray-900">Resultado del Proceso</h2>
            </CardHeader>
            <CardContent>
              {uploadAction.value?.success ? (
                <div class="space-y-4">
                  <div class="bg-green-50 border border-green-200 rounded-md p-4">
                    <div class="flex">
                      <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 011.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                      </div>
                      <div class="ml-3">
                        <p class="text-sm font-medium text-green-800">Proceso completado</p>
                        <p class="text-sm text-green-700 mt-1">
                          {uploadAction.value.result.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-blue-50 p-3 rounded-md">
                      <div class="text-2xl font-bold text-blue-600">
                        {uploadAction.value.result.inserted}
                      </div>
                      <div class="text-sm text-blue-800">Insertados</div>
                    </div>
                    <div class="bg-yellow-50 p-3 rounded-md">
                      <div class="text-2xl font-bold text-yellow-600">
                        {uploadAction.value.result.updated}
                      </div>
                      <div class="text-sm text-yellow-800">Actualizados</div>
                    </div>
                  </div>

                  {uploadAction.value.result.warnings.length > 0 && (
                    <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <div class="flex">
                        <div class="flex-shrink-0">
                          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm font-medium text-yellow-800">Advertencias</p>
                          <ul class="text-sm text-yellow-700 mt-1 list-disc list-inside">
                            {uploadAction.value.result.warnings.map((warning: string, index: number) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : uploadAction.value?.error ? (
                <div class="bg-red-50 border border-red-200 rounded-md p-4">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm font-medium text-red-800">Error en el proceso</p>
                      <p class="text-sm text-red-700 mt-1">
                        {uploadAction.value.error}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div class="text-center text-gray-500 py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 class="mt-2 text-sm font-medium text-gray-900">Sin resultados</h3>
                  <p class="mt-1 text-sm text-gray-500">
                    Sube un archivo Excel para ver los resultados del procesamiento.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instrucciones */}
        <Card class="mt-8">
          <CardHeader>
            <h2 class="text-xl font-semibold text-gray-900">Formato del Archivo Excel</h2>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <p class="text-gray-600">
                El archivo Excel debe tener las siguientes columnas en la primera fila:
              </p>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Columna
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Requerido
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">fecha</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Texto</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Sí</td>
                      <td class="px-6 py-4 text-sm text-gray-500">Fecha en formato DD/MM/YYYY o YYYY-MM-DD</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">turno</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Texto</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">No</td>
                      <td class="px-6 py-4 text-sm text-gray-500">mañana, tarde, noche (vacío si es vacaciones)</td>
                    </tr>
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">vacaciones</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Texto/Bool</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">Sí</td>
                      <td class="px-6 py-4 text-sm text-gray-500">TRUE/FALSE, 1/0, sí/no</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">startshift</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Texto</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">No</td>
                      <td class="px-6 py-4 text-sm text-gray-500">Hora de inicio del turno (HH:MM, ej: 08:00)</td>
                    </tr>
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">endshift</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Texto</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">No</td>
                      <td class="px-6 py-4 text-sm text-gray-500">Hora de fin del turno (HH:MM, ej: 16:00)</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">notas</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Texto</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">No</td>
                      <td class="px-6 py-4 text-sm text-gray-500">Notas adicionales del turno</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-blue-800">Nota importante</h3>
                    <div class="mt-2 text-sm text-blue-700">
                      <ul class="list-disc list-inside space-y-1">
                        <li>La primera fila debe contener los encabezados exactamente como se muestran</li>
                        <li>Si <code>vacaciones</code> es verdadero, los campos <code>turno</code>, <code>startshift</code> y <code>endshift</code> pueden estar vacíos</li>
                        <li>Las fechas se normalizarán automáticamente al formato YYYY-MM-DD</li>
                        <li>Las horas se normalizarán automáticamente al formato HH:MM (24 horas)</li>
                        <li>Si se especifica <code>startshift</code>, también se debe especificar <code>endshift</code> y viceversa</li>
                        <li>Los turnos existentes se actualizarán si ya existe un registro para esa fecha</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
});

export const head: DocumentHead = {
  title: "Admin - Cargar Turnos",
  meta: [
    {
      name: "description",
      content: "Interfaz de administración para cargar turnos desde archivos Excel",
    },
  ],
};
