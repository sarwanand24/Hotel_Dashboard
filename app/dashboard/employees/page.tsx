'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmployeeForm } from '@/components/dashboard/employee-form';
import { Plus, Edit, Trash2, Users, Phone, Calendar } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Employee } from '@/lib/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    setEmployees(db.getEmployees());
  };

  const handleAddEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    db.addEmployee(employeeData);
    loadEmployees();
    setIsFormOpen(false);
  };

  const handleEditEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingEmployee) {
      db.updateEmployee(editingEmployee.id, employeeData);
      loadEmployees();
      setEditingEmployee(undefined);
      setIsFormOpen(false);
    }
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      db.deleteEmployee(employeeId);
      loadEmployees();
    }
  };

  const toggleEmployeeStatus = (employee: Employee) => {
    db.updateEmployee(employee.id, { isActive: !employee.isActive });
    loadEmployees();
  };

  const openEditForm = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEmployee(undefined);
  };

  const totalSalaryExpense = employees
    .filter(emp => emp.isActive)
    .reduce((sum, emp) => sum + emp.monthlySalary, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-2">Manage your hotel staff and payroll</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{employees.length}</div>
            <div className="text-gray-600 text-sm">Total Employees</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {employees.filter(emp => emp.isActive).length}
            </div>
            <div className="text-gray-600 text-sm">Active Staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatCurrency(totalSalaryExpense)}
            </div>
            <div className="text-gray-600 text-sm">Monthly Expense</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatCurrency(totalSalaryExpense / (employees.filter(emp => emp.isActive).length || 1))}
            </div>
            <div className="text-gray-600 text-sm">Avg. Salary</div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{employee.designation}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditForm(employee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge 
                  variant={employee.isActive ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => toggleEmployeeStatus(employee)}
                >
                  {employee.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Salary:</span>
                <span className="font-semibold">{formatCurrency(employee.monthlySalary)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {employee.contactNumber}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Joined {formatDate(employee.joiningDate)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first employee.</p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Employee
          </Button>
        </Card>
      )}

      {/* Employee Form Modal */}
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
        employee={editingEmployee}
      />
    </div>
  );
}