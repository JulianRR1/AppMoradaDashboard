"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export function DataTable({
  columns,
  data,
  isLoading,
  onEdit,
  onDelete,
  emptyMessage = "No hay datos registrados",
  skeletonColumns = 5,
  caption,
  getRowLabel,
  icon: Icon,
  pageSize = 10,
}) {
  const [page, setPage] = useState(1);
  // Registro pendiente de eliminar: muestra confirmación antes de borrar.
  const [pendingDelete, setPendingDelete] = useState(null);
  const hasActions = Boolean(onEdit || onDelete);

  const confirmDelete = () => {
    if (pendingDelete) onDelete(pendingDelete._id);
    setPendingDelete(null);
  };

  // Nombre descriptivo del registro para los botones de acción (WCAG 2.4.4/4.1.2).
  const rowLabel = (item) => (getRowLabel ? getRowLabel(item) : "registro");

  const total = Array.isArray(data) ? data.length : 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Si los datos cambian y la página actual queda fuera de rango, corregir.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount, page]);

  const showPagination = !isLoading && total > pageSize;
  const start = (page - 1) * pageSize;
  const pageData = isLoading ? [] : data.slice(start, start + pageSize);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {caption && (
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            {Icon && (
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
            <span className="text-sm font-medium">{caption}</span>
          </div>
          {!isLoading && (
            <span className="text-xs font-medium rounded-full px-2.5 py-0.5 bg-purple-100 text-purple-800">
              {total} {total === 1 ? "registro" : "registros"}
            </span>
          )}
        </div>
      )}

      <Table>
        {caption && <TableCaption className="sr-only">{caption}</TableCaption>}
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            {columns.map((col, index) => (
              <TableHead
                key={index}
                scope="col"
                className={`text-xs font-medium ${col.className || ""}`}
              >
                {col.header}
              </TableHead>
            ))}
            {hasActions && (
              <TableHead scope="col" className="text-xs font-medium text-right">
                Acciones
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell>
                    <Skeleton className="h-8 w-[80px] ml-auto" />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : total === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            pageData.map((item, rowIndex) => (
              <TableRow
                key={item._id || start + rowIndex}
                className="transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className={col.className}>
                    {col.cell ? col.cell(item) : item[col.accessorKey]}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          title="Editar"
                          size="icon"
                          aria-label={`Editar ${rowLabel(item)}`}
                          className="h-9 w-9 rounded-md border-0 bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95 transition"
                          onClick={() => onEdit(item)}
                        >
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          title="Eliminar"
                          size="icon"
                          aria-label={`Eliminar ${rowLabel(item)}`}
                          className="h-9 w-9 rounded-md border-0 bg-red-50 text-red-700 hover:bg-red-100 active:scale-95 transition"
                          onClick={() => setPendingDelete(item)}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!isLoading && total > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t text-xs text-muted-foreground">
          <span>
            Mostrando {start + 1}–{Math.min(start + pageSize, total)} de {total}
          </span>
          {showPagination && (
            <div className="flex items-center gap-3">
              <span>
                Página {page} de {pageCount}
              </span>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Página anterior"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Página siguiente"
                  disabled={page === pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete ? `Vas a eliminar ${rowLabel(pendingDelete)}. ` : ""}
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-600"
              onClick={confirmDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
