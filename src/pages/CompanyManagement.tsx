import { useEffect, useState } from 'react';
import axios from 'axios';

// Create an axios instance with interceptor
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  timeout: 10000,
});

interface Entreprise {
  _id?: string;
  name: string;
  domaine: string;
  description: string;
  logo: string;
  salle_affectee: string;
  stande: string;
}

const API_URL = '/entreprises';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState<Entreprise[]>([]);
  const [form, setForm] = useState<Entreprise>({ name: '', domaine: '', description: '', logo: '', salle_affectee: '', stande: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    const res = await api.get(API_URL);
    const data = res.data;
    const companiesArray = Array.isArray(data) ? data : (Array.isArray(data.companies) ? data.companies : []);
    setCompanies(companiesArray);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    delete payload._id; // Always remove _id before sending
    if (editingId) {
      await api.put(`${API_URL}/${editingId}`, payload);
    } else {
      await api.post(API_URL, payload);
    }
    setForm({ name: '', domaine: '', description: '', logo: '', salle_affectee: '', stande: '' });
    setEditingId(null);
    fetchCompanies();
  };

  const handleEdit = (company: Entreprise) => {
    setForm(company);
    setEditingId(company._id || null);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`${API_URL}/${id}`);
    fetchCompanies();
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des Entreprises</h1>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4 bg-white p-4 rounded shadow">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Nom de l'entreprise" className="w-full border p-2 rounded" required />
        <input name="domaine" value={form.domaine} onChange={handleChange} placeholder="Domaine" className="w-full border p-2 rounded" required />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2 rounded" />
        <input name="logo" value={form.logo} onChange={handleChange} placeholder="Logo URL" className="w-full border p-2 rounded" />
        <input name="salle_affectee" value={form.salle_affectee} onChange={handleChange} placeholder="Salle affectée" className="w-full border p-2 rounded" />
        <input name="stande" value={form.stande} onChange={handleChange} placeholder="Stande" className="w-full border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Mettre à jour' : 'Ajouter'} Entreprise</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', domaine: '', description: '', logo: '', salle_affectee: '', stande: '' }); }} className="ml-2 text-gray-600">Annuler</button>}
      </form>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Domaine</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Logo</th>
            <th className="p-2 border">Salle affectée</th>
            <th className="p-2 border">Stande</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <tr><td colSpan={7} className="text-center">Chargement...</td></tr> : Array.isArray(companies) ? companies.map((c) => (
            <tr key={c._id}>
              <td className="p-2 border">{c.name}</td>
              <td className="p-2 border">{c.domaine}</td>
              <td className="p-2 border">{c.description}</td>
              <td className="p-2 border">{c.logo}</td>
              <td className="p-2 border">{c.salle_affectee}</td>
              <td className="p-2 border">{c.stande}</td>
              <td className="p-2 border">
                <button onClick={() => handleEdit(c)} className="text-blue-600 mr-2">Modifier</button>
                <button onClick={() => handleDelete(c._id!)} className="text-red-600">Supprimer</button>
              </td>
            </tr>
          )) : null}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyManagement; 