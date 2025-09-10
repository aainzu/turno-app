import { routeAction$, zod$ } from '@builder.io/qwik-city';
import { turnosService } from '../../../lib/services/turnos.service';

// POST /api/ingesta/excel - Subir y procesar archivo Excel
export const useUploadExcel = routeAction$(
  async (formData, requestEvent) => {
    try {
      // Obtener el archivo del form data
      const file = formData.get('file') as File;

      if (!file) {
        return requestEvent.json({
          error: 'No se encontró archivo en la solicitud',
          details: ['El campo "file" es requerido']
        }, { status: 400 });
      }

      // Validar archivo
      const fileValidation = turnosService.validateExcelFile(file);
      if (!fileValidation.valid) {
        return requestEvent.json({
          error: 'Archivo inválido',
          details: fileValidation.errors
        }, { status: 400 });
      }

      // Procesar archivo a través del backend
      const result = await turnosService.processExcelFile(file);

      return requestEvent.json({
        message: 'Archivo procesado exitosamente',
        ...result
      }, { status: 200 });

    } catch (error) {
      console.error('Error en POST /api/ingesta/excel:', error);

      return requestEvent.json({
        error: 'Error procesando el archivo Excel',
        message: error instanceof Error ? error.message : 'Error desconocido',
        details: []
      }, { status: 500 });
    }
  },
  zod$({
    file: zod$(File)
      .refine((file) => file.size > 0, 'El archivo no puede estar vacío')
      .refine((file) => file.size < (parseInt(process.env.MAX_UPLOAD_MB || '5') * 1024 * 1024),
        `El archivo es demasiado grande (máx ${process.env.MAX_UPLOAD_MB || '5'}MB)`)
      .refine((file) => file.name.toLowerCase().endsWith('.xlsx'),
        'Solo se permiten archivos Excel (.xlsx)')
  })
);
