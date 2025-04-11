import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey: string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface ActionMenuItem<T> {
  label: string;
  onClick: (item: T) => void;
  icon?: React.ReactNode;
  disabled?: boolean | ((item: T) => boolean);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actionMenuItems?: ActionMenuItem<T>[];
  isLoading?: boolean;
  className?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  pageSize?: number;
  itemCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  actionMenuItems,
  isLoading = false,
  className,
  onRowClick,
  rowClassName,
  pageSize = 10,
  itemCount,
  currentPage = 1,
  onPageChange,
  emptyState,
}: DataTableProps<T>) {
  // If data is empty and not loading, show empty state
  if (data.length === 0 && !isLoading) {
    return (
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="flex justify-center items-center py-16">
          {emptyState || (
            <div className="text-center">
              <p className="text-gray-500">Aucun résultat</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle pagination
  const pageCount = itemCount ? Math.ceil(itemCount / pageSize) : 1;
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Calculate start and end items for pagination display
  const startItem = ((currentPage - 1) * pageSize) + 1;
  const endItem = Math.min(currentPage * pageSize, itemCount || data.length);
  const totalItems = itemCount || data.length;

  return (
    <div className={cn("bg-white border rounded-lg overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider",
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
              {actionMenuItems && (
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, rowIndex) => (
                <TableRow key={`loading-${rowIndex}`}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={`loading-cell-${colIndex}`} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 bg-slate-200 rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                  {actionMenuItems && (
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-5 w-8 bg-slate-200 rounded animate-pulse ml-auto"></div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              // Data rows
              data.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-slate-50",
                    rowClassName && rowClassName(item)
                  )}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell
                      key={`${rowIndex}-${colIndex}`}
                      className={cn("px-6 py-4 whitespace-nowrap", column.className)}
                    >
                      {column.cell ? column.cell(item) : (
                        <span>{(item as any)[column.accessorKey]}</span>
                      )}
                    </TableCell>
                  ))}
                  {actionMenuItems && (
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actionMenuItems.map((action, actionIndex) => {
                            const isDisabled = typeof action.disabled === 'function' 
                              ? action.disabled(item) 
                              : action.disabled;
                              
                            return (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(item);
                                }}
                                disabled={isDisabled}
                                className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                              >
                                {action.icon && <span className="mr-2">{action.icon}</span>}
                                {action.label}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {(itemCount !== undefined || data.length > 0) && (
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
            >
              Suivant
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Affichage de <span className="font-medium">{startItem}</span> à{" "}
                <span className="font-medium">{endItem}</span> sur{" "}
                <span className="font-medium">{totalItems}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Précédent</span>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                {/* Render page numbers */}
                {Array.from({ length: Math.min(5, pageCount) }).map((_, index) => {
                  let pageNumber = currentPage;
                  
                  // Logic to show pages around current page
                  if (pageCount <= 5) {
                    pageNumber = index + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1;
                  } else if (currentPage >= pageCount - 2) {
                    pageNumber = pageCount - 4 + index;
                  } else {
                    pageNumber = currentPage - 2 + index;
                  }
                  
                  if (pageNumber > pageCount) return null;
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "relative inline-flex items-center px-4 py-2 border text-sm font-medium",
                        currentPage === pageNumber 
                          ? "z-10 bg-primary-50 border-primary-500 text-primary-600" 
                          : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
                      )}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pageCount}
                >
                  <span className="sr-only">Suivant</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
