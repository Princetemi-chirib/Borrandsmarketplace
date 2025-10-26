'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, ArrowLeft, Image as ImageIcon, Save, X, ArrowUp, ArrowDown } from 'lucide-react';

interface MenuItemForm {
	name: string;
	description: string;
	price: number;
	categoryId?: string;
	image?: string;
	isAvailable: boolean;
	packId?: string;
	priceDescription?: string;
	isPublished?: boolean;
}

const initialItems: MenuItemForm[] = [];

export default function MenuManagementPage() {
	const router = useRouter();
	const [items, setItems] = useState<MenuItemForm[]>(initialItems);
	const [categories, setCategories] = useState<Array<{ _id?: string; name: string; description?: string; isActive: boolean; sortOrder?: number }>>([]);
	const [packs, setPacks] = useState<Array<{ _id?: string; name: string; price: number; isActive: boolean }>>([]);
	const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'packs'>('items');
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [editIndex, setEditIndex] = useState<number | null>(null);
	const [form, setForm] = useState<MenuItemForm>({ name: '', description: '', price: 0, categoryId: undefined, image: '', isAvailable: true, packId: undefined, priceDescription: '', isPublished: true });
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [optionUI, setOptionUI] = useState<{ open: boolean; itemId?: string; itemName?: string }>(() => ({ open: false }));
	const [optionGroups, setOptionGroups] = useState<Array<any>>([]);
	const [newGroup, setNewGroup] = useState<{ name: string; minSelect: number; maxSelect: number; optionsText: string }>({ name: '', minSelect: 0, maxSelect: 1, optionsText: '' });
	const [uploading, setUploading] = useState<boolean>(false);

	// Load items from API
	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const res = await fetch('/api/menu', { credentials: 'include' });
				const json = await res.json();
				if (res.ok && json.items) {
					setItems(json.items);
				} else {
					setError(json.message || 'Failed to load menu');
				}
			} catch (e) {
				setError('Network error while loading menu');
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// Option Groups loader
	const loadOptionGroups = async (itemId: string) => {
		const res = await fetch(`/api/option-groups?itemId=${itemId}`, { credentials: 'include' });
		const json = await res.json();
		if (res.ok && json.groups) setOptionGroups(json.groups);
	};

	// Load categories
	useEffect(() => {
		(async () => {
			try {
				const res = await fetch('/api/categories', { credentials: 'include' });
				const json = await res.json();
				if (res.ok && json.categories) setCategories(json.categories);
			} catch {}
		})();
	}, []);

	// Load packs
	useEffect(() => {
		(async () => {
			try {
				const res = await fetch('/api/packs', { credentials: 'include' });
				const json = await res.json();
				if (res.ok && json.packs) setPacks(json.packs);
			} catch {}
		})();
	}, []);

	const resetForm = () => {
		setForm({ name: '', description: '', price: 0, categoryId: undefined, image: '', isAvailable: true, packId: undefined, priceDescription: '', isPublished: true });
		setEditIndex(null);
		setIsEditing(false);
	};

	const startCreate = () => {
		resetForm();
		setIsEditing(true);
	};

	const startEdit = (index: number) => {
		// Convert any loaded item shape into our form shape
		const raw: any = (items as any)[index];
		setForm({
			name: raw.name || '',
			description: raw.description || '',
			price: raw.price || 0,
			categoryId: raw.categoryId || raw.category || undefined,
			image: raw.image || '',
			isAvailable: Boolean(raw.isAvailable),
			packId: raw.packId || undefined,
			priceDescription: raw.priceDescription || '',
			isPublished: Boolean(raw.isPublished),
		});
		setEditIndex(index);
		setIsEditing(true);
	};

	// Reorder items (simple up/down) and persist sortOrder
	const moveItem = async (index: number, direction: 'up' | 'down') => {
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= items.length) return;
		const newItems = [...(items as any[])];
		const a: any = newItems[index];
		const b: any = newItems[targetIndex];
		[newItems[index], newItems[targetIndex]] = [b, a];
		setItems(newItems as any);
		// Persist their sortOrder (use target positions)
		try {
			if (a?._id) await fetch(`/api/menu/${a._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ sortOrder: targetIndex }) });
			if (b?._id) await fetch(`/api/menu/${b._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ sortOrder: index }) });
		} catch {}
	};

	const removeItem = async (index: number) => {
		try {
			const target: any = (items as any)[index];
			if (!target || !(target as any)._id) {
				// Optimistic local remove for unsaved item
				setItems(prev => prev.filter((_, i) => i !== index));
				return;
			}
			const id = (target as any)._id;
			const res = await fetch(`/api/menu/${id}`, { method: 'DELETE', credentials: 'include' });
			if (res.ok) setItems(prev => prev.filter((_, i) => i !== index));
		} catch {}
	};

	const saveItem = async () => {
		if (!form.name || !form.description || !form.categoryId || !form.price) return;
		try {
			setLoading(true);
			const payload: any = {
				name: form.name,
				description: form.description,
				price: form.price,
				priceDescription: form.priceDescription,
				image: form.image,
				isAvailable: form.isAvailable,
				isPublished: form.isPublished!==false,
				categoryId: form.categoryId,
				packId: form.packId || undefined,
			};
			if (editIndex === null) {
				const res = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
				const json = await res.json();
				if (res.ok) setItems(prev => [json.item, ...prev]);
			} else {
				const existing: any = (items as any)[editIndex];
				if (existing && existing._id) {
					const res = await fetch(`/api/menu/${existing._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
					const json = await res.json();
					if (res.ok) setItems(prev => prev.map((it: any, i) => (i === editIndex ? json.item : it)));
				} else {
					// fallback create
					const res = await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
					const json = await res.json();
					if (res.ok) setItems(prev => prev.map((it, i) => (i === editIndex ? json.item : it)));
				}
			}
		} finally {
			setLoading(false);
			resetForm();
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
				{/* Tabs */}
				<div className="mb-4 border-b border-gray-200">
					<nav className="flex space-x-4">
						<button onClick={() => setActiveTab('items')} className={`px-3 py-2 text-sm font-medium rounded-t ${activeTab==='items'?'bg-white border border-b-0 border-gray-200 text-gray-900':'text-gray-600 hover:text-gray-900'}`}>Items</button>
						<button onClick={() => setActiveTab('categories')} className={`px-3 py-2 text-sm font-medium rounded-t ${activeTab==='categories'?'bg-white border border-b-0 border-gray-200 text-gray-900':'text-gray-600 hover:text-gray-900'}`}>Categories</button>
						<button onClick={() => setActiveTab('packs')} className={`px-3 py-2 text-sm font-medium rounded-t ${activeTab==='packs'?'bg-white border border-b-0 border-gray-200 text-gray-900':'text-gray-600 hover:text-gray-900'}`}>Packs</button>
					</nav>
				</div>
				<div className="flex items-center gap-3 mb-4 sm:mb-6">
					<button onClick={() => router.back()} className="p-2 rounded-md bg-white border border-gray-200 hover:bg-gray-50">
						<ArrowLeft className="h-5 w-5 text-gray-700" />
					</button>
					<h1 className="text-lg sm:text-2xl font-bold text-gray-900">Menu Management</h1>
					<div className="ml-auto">
						<Link href="/dashboard/restaurant" className="text-sm text-brand-primary hover:text-brand-accent">Dashboard</Link>
					</div>
				</div>

			{/* Items Tab: Editor Card - Mobile-first stacked layout */}
			{activeTab==='items' && (
			<>
			<div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-5">
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-base sm:text-lg font-semibold text-gray-900">{editIndex === null ? 'Add New Item' : 'Edit Item'}</h2>
					{!isEditing && (
						<button onClick={startCreate} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm">
							<Plus className="h-4 w-4" /> New
						</button>
					)}
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
						<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" placeholder="e.g., Suya Wrap" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
						<select value={form.categoryId || ''} onChange={(e) => setForm({ ...form, categoryId: e.target.value || undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900">
							<option value="">Select category</option>
							{categories.map(c => (
								<option key={c._id} value={c._id}>{c.name}</option>
							))}
						</select>
					</div>
					<div className="sm:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
						<textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" placeholder="Short tasty description" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
						<input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value || '0') })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" placeholder="2000" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Price description (optional)</label>
						<input value={form.priceDescription||''} onChange={(e)=> setForm({ ...form, priceDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" placeholder="per plate / per bowl" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
						<input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" placeholder="https://..." />
						<div className="mt-2 flex items-center gap-2">
							<input type="file" accept="image/*" onChange={async (e) => {
								const file = e.target.files?.[0];
								if (!file) return;
								try {
									setUploading(true);
									const fd = new FormData();
									fd.append('file', file);
									const res = await fetch('/api/uploads', { method: 'POST', body: fd });
									const json = await res.json();
									if (res.ok && json.url) setForm(prev => ({ ...prev, image: json.url }));
								} finally {
									setUploading(false);
								}
							}} />
							{uploading && <span className="text-xs text-gray-500">Uploading...</span>}
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Pack (optional)</label>
						<select value={(form as any).packId || ''} onChange={(e)=> setForm({ ...form, ...(e.target.value? { packId: e.target.value } : { packId: undefined }) } as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900">
							<option value="">No pack</option>
							{packs.map(p => (
								<option key={p._id} value={p._id}>{p.name} (₦{p.price})</option>
							))}
						</select>
					</div>
					<div className="flex items-center gap-2 sm:col-span-2">
						<input id="isAvailable" type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="h-4 w-4" />
						<label htmlFor="isAvailable" className="text-sm text-gray-700">Available</label>
						<input id="isPublished" type="checkbox" checked={form.isPublished!==false} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="h-4 w-4 ml-4" />
						<label htmlFor="isPublished" className="text-sm text-gray-700">Published</label>
					</div>
				</div>

				{isEditing && (
					<div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
						<button onClick={saveItem} className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-accent text-white px-4 py-2 rounded-lg text-sm">
							<Save className="h-4 w-4" /> Save
						</button>
						<button onClick={resetForm} className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm">
							<X className="h-4 w-4" /> Cancel
						</button>
					</div>
				)}
			</div>

			{/* Items list - mobile friendly cards */}
			<div className="space-y-3">
				{items.map((item, index) => (
					<div key={index} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
						<div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
							<div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
								<ImageIcon className="h-5 w-5" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
									{!item.isAvailable && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Unavailable</span>}
									{(item as any).isPublished===false && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Unpublished</span>}
								</div>
								<p className="text-sm text-gray-600 truncate">{item.description}</p>
								<div className="text-sm text-gray-900 font-medium">₦{item.price.toLocaleString()} { (item as any).priceDescription? <span className="text-xs text-gray-500">({(item as any).priceDescription})</span> : null }</div>
								<div className="text-xs text-gray-500">{(() => {
									const anyItem: any = item as any;
									const id = anyItem.categoryId || anyItem.category;
									const cat = categories.find(c => c._id === id);
									return cat ? cat.name : (typeof id === 'string' ? id : '');
								})()}</div>
							</div>
						</div>
						<div className="flex items-center gap-2 sm:self-start">
							<button onClick={() => startEdit(index)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">
								<Pencil className="h-4 w-4" /> Edit
							</button>
							<button onClick={() => removeItem(index)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm">
								<Trash2 className="h-4 w-4" /> Delete
							</button>
							<button onClick={() => moveItem(index, 'up')} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm" title="Move up">
								<ArrowUp className="h-4 w-4" />
							</button>
							<button onClick={() => moveItem(index, 'down')} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm" title="Move down">
								<ArrowDown className="h-4 w-4" />
							</button>
							<button onClick={() => { const anyItem:any = item as any; if (anyItem?._id) { setOptionUI({ open: true, itemId: anyItem._id as any, itemName: item.name }); loadOptionGroups(anyItem._id as any); } }} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-sm">
								Options
							</button>
						</div>
					</div>
				))}
			</div>
			{/* Render Option Groups Panel */}
			{optionUI.open && (
				<OptionGroupsPanel
					open={optionUI.open}
					onClose={() => setOptionUI({ open: false })}
					itemId={optionUI.itemId}
					itemName={optionUI.itemName}
					groups={optionGroups}
					onGroupsChange={setOptionGroups}
				/>
			)}
			</>
			)}

			{/* Categories Tab */}
			{activeTab==='categories' && (
				<div className="space-y-4">
					{/* Create / Edit Category */}
					<CategoryEditor
						onCreated={(cat) => setCategories(prev => [cat, ...prev])}
					/>
					{/* Categories list */}
					<div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
						<div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
							<h3 className="text-sm font-semibold text-gray-900">Categories</h3>
							<span className="text-xs text-gray-500">{categories.length} total</span>
						</div>
						<div className="divide-y">
							{categories.map((cat, idx) => (
								<div key={cat._id || idx} className="p-4 flex items-center justify-between">
									<div>
										<div className="font-medium text-gray-900">{cat.name}</div>
										<div className="text-xs text-gray-500">{cat.description}</div>
									</div>
									<div className="flex items-center gap-2">
										<button onClick={async () => {
											const res = await fetch(`/api/categories/${cat._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ isActive: !cat.isActive }) });
											if (res.ok) setCategories(prev => prev.map((c, i) => i===idx ? { ...c, isActive: !c.isActive } : c));
										}} className={`px-3 py-1.5 rounded-lg text-sm ${cat.isActive?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{cat.isActive?'Published':'Unpublished'}</button>
										<button onClick={async () => {
											if (!cat._id) return;
											const res = await fetch(`/api/categories/${cat._id}`, { method: 'DELETE', credentials: 'include' });
											if (res.ok) setCategories(prev => prev.filter((_, i) => i!==idx));
										}} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Delete</button>
									</div>
								</div>
							))}
							{categories.length===0 && (
								<div className="p-6 text-center text-gray-500 text-sm">No categories yet</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Packs Tab */}
			{activeTab==='packs' && (
				<div className="space-y-4">
					<PackEditor onCreated={(pack) => setPacks(prev => [pack, ...prev])} />
					<div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
						<div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
							<h3 className="text-sm font-semibold text-gray-900">Packs</h3>
							<span className="text-xs text-gray-500">{packs.length} total</span>
						</div>
						<div className="divide-y">
							{packs.map((p, idx) => (
								<div key={p._id || idx} className="p-4 flex items-center justify-between">
									<div>
										<div className="font-medium text-gray-900">{p.name} <span className="text-xs text-gray-500">₦{p.price}</span></div>
									</div>
									<div className="flex items-center gap-2">
										<button onClick={async () => {
											const res = await fetch(`/api/packs/${p._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ isActive: !p.isActive }) });
											if (res.ok) setPacks(prev => prev.map((x, i) => i===idx ? { ...x, isActive: !x.isActive } : x));
										}} className={`px-3 py-1.5 rounded-lg text-sm ${p.isActive?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{p.isActive?'Active':'Inactive'}</button>
										<button onClick={async () => {
											if (!p._id) return;
											const res = await fetch(`/api/packs/${p._id}`, { method: 'DELETE', credentials: 'include' });
											if (res.ok) setPacks(prev => prev.filter((_, i) => i!==idx));
										}} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Delete</button>
									</div>
								</div>
							))}
							{packs.length===0 && (
								<div className="p-6 text-center text-gray-500 text-sm">No packs yet</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	</div>
	);
}

// Simple Category Editor inline component (local-only state)
function CategoryEditor({ onCreated }: { onCreated: (c: any) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const createCategory = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, description, isActive })
      });
      const json = await res.json();
      if (res.ok && json.category) {
        onCreated(json.category);
        setName('');
        setDescription('');
        setIsActive(true);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Category name" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" />
        <input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description (optional)" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} />
            Publish now
          </label>
          <button onClick={createCategory} disabled={saving || !name.trim()} className="ml-auto px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent disabled:opacity-50 text-sm">
            {saving ? 'Saving...' : 'Create category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Option Groups Panel (inline simple panel)
function OptionGroupsPanel({ open, onClose, itemId, itemName, groups, onGroupsChange }:{ open:boolean; onClose:() => void; itemId?:string; itemName?:string; groups:any[]; onGroupsChange:(gs:any[])=>void }){
  const [name, setName] = useState('');
  const [minSelect, setMinSelect] = useState(0);
  const [maxSelect, setMaxSelect] = useState(1);
  const [optionsText, setOptionsText] = useState('');
  if (!open) return null;
  const create = async () => {
    if (!itemId || !name.trim()) return;
    const options = optionsText.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{ const [n,p] = l.split('|'); return { name: n.trim(), price: Number(p||0) }; });
    const res = await fetch('/api/option-groups', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'include', body: JSON.stringify({ itemId, name, minSelect, maxSelect, options }) });
    const json = await res.json();
    if (res.ok && json.group){ onGroupsChange([json.group, ...groups]); setName(''); setOptionsText(''); setMinSelect(0); setMaxSelect(1); }
  };
  const del = async (id:string, idx:number) => {
    const res = await fetch(`/api/option-groups/${id}`, { method:'DELETE', credentials:'include' });
    if (res.ok) onGroupsChange(groups.filter((_,i)=>i!==idx));
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-xl sm:shadow-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">Option groups for</div>
            <h3 className="text-lg font-semibold text-gray-900">{itemName}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>
        {/* Create group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Group name (e.g., Sides)" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" />
          <div className="flex items-center gap-2">
            <input type="number" min={0} value={minSelect} onChange={e=>setMinSelect(parseInt(e.target.value||'0'))} className="w-20 px-3 py-2 border border-gray-300 rounded-lg" />
            <span className="text-sm text-gray-600">min</span>
            <input type="number" min={0} value={maxSelect} onChange={e=>setMaxSelect(parseInt(e.target.value||'1'))} className="w-20 px-3 py-2 border border-gray-300 rounded-lg" />
            <span className="text-sm text-gray-600">max</span>
          </div>
          <button onClick={create} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent">Create group</button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line: Name|Price)</label>
          <textarea rows={3} value={optionsText} onChange={e=>setOptionsText(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" placeholder={"Fried Plantain|500\nColeslaw|300"} />
        </div>
        {/* List */}
        <div className="divide-y border rounded-lg">
          {groups.map((g:any, idx:number)=> (
            <div key={g._id||idx} className="p-3 flex items-start justify-between">
              <div>
                <div className="font-medium text-gray-900">{g.name} <span className="text-xs text-gray-500">(min {g.minSelect}, max {g.maxSelect})</span></div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {g.options?.map((o:any,i:number)=> (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">{o.name}{o.price?` (+₦${o.price})`:''}</span>
                  ))}
                </div>
              </div>
              <button onClick={()=> del(g._id, idx)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Delete</button>
            </div>
          ))}
          {groups.length===0 && (
            <div className="p-6 text-center text-gray-500 text-sm">No option groups yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PackEditor({ onCreated }: { onCreated: (p: any) => void }) {
	const [name, setName] = useState('');
	const [price, setPrice] = useState<number>(0);
	const [description, setDescription] = useState('');
	const [isActive, setIsActive] = useState(true);
	const [saving, setSaving] = useState(false);
	const createPack = async () => {
		if (!name.trim()) return;
		try {
			setSaving(true);
			const res = await fetch('/api/packs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name, description, price, isActive }) });
			const json = await res.json();
			if (res.ok && json.pack) {
				onCreated(json.pack);
				setName(''); setDescription(''); setPrice(0); setIsActive(true);
			}
		} finally {
			setSaving(false);
		}
	};
	return (
		<div className="bg-white border border-gray-200 rounded-xl p-4">
			<div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
				<input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Pack name" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" />
				<input type="number" min={0} value={price} onChange={(e)=>setPrice(parseInt(e.target.value||'0'))} placeholder="Price" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" />
				<input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description (optional)" className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" />
				<div className="flex items-center gap-3">
					<label className="flex items-center gap-2 text-sm text-gray-700">
						<input type="checkbox" checked={isActive} onChange={(e)=>setIsActive(e.target.checked)} />
						Active
					</label>
					<button onClick={createPack} disabled={saving || !name.trim()} className="ml-auto px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-accent disabled:opacity-50 text-sm">
						{saving ? 'Saving...' : 'Create pack'}
					</button>
				</div>
			</div>
		</div>
	);
}
