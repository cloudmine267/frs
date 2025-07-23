import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { localDB } from '@/lib/localStorage';

export default function UserForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company: '',
    role: '',
    is_admin: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      localDB.users.create({
        ...formData,
        created_at: new Date().toISOString()
      });
      if (onSuccess) onSuccess();
      setFormData({ email: '', password: '', full_name: '', company: '', role: '', is_admin: false });
    } catch (err: any) {
      setError('Failed to add user.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Add User</h2>
      <Input
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <Input
        value={formData.password}
        onChange={e => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        type="password"
        required
      />
      <Input
        value={formData.full_name}
        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
        placeholder="Full Name"
      />
      <Input
        value={formData.company}
        onChange={e => setFormData({ ...formData, company: e.target.value })}
        placeholder="Company"
      />
      <Input
        value={formData.role}
        onChange={e => setFormData({ ...formData, role: e.target.value })}
        placeholder="Role"
      />
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.is_admin}
          onChange={e => setFormData({ ...formData, is_admin: e.target.checked })}
        />
        <label>Is Admin?</label>
      </div>
      {error && <div className="text-red-600">{error}</div>}
      <Button type="submit" className="bg-blue-600 text-white" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add User'}
      </Button>
    </form>
  );
}
