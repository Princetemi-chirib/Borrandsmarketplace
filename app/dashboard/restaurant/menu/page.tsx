'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, ArrowLeft, Image as ImageIcon, Save, X, ArrowUp, ArrowDown, ToggleLeft, ToggleRight, Power } from 'lucide-react';
import { getImageUrl, isValidImageUrl } from '@/lib/image-utils';

interface MenuItemForm {
	name: string;
	description: string;
	price: number | '';
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
	const [form, setForm] = useState<MenuItemForm>({ name: '', description: '', price: '', categoryId: undefined, image: '', isAvailable: true, packId: undefined, priceDescription: '', isPublished: true });
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [optionUI, setOptionUI] = useState<{ open: boolean; itemId?: string; itemName?: string }>(() => ({ open: false }));
	const [optionGroups, setOptionGroups] = useState<Array<any>>([]);
	const [newGroup, setNewGroup] = useState<{ name: string; minSelect: number; maxSelect: number; optionsText: string }>({ name: '', minSelect: 0, maxSelect: 1, optionsText: '' });
	const [uploading, setUploading] = useState<boolean>(false);
	const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

	// Load items from API
	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem('token');
				const headers: any = {};
				if (token) headers['Authorization'] = `Bearer ${token}`;
				
				const res = await fetch('/api/menu', { headers, credentials: 'include' });
				const json = await res.json();
				if (res.ok && json.items) {
					// Map id to _id for UI compatibility
					const normalizedItems = json.items.map((item: any) => ({
						...item,
						_id: item.id || item._id
					}));
					setItems(normalizedItems);
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
				const token = localStorage.getItem('token');
				const headers: any = {};
				if (token) headers['Authorization'] = `Bearer ${token}`;
				
				const res = await fetch('/api/categories', { headers, credentials: 'include' });
				const json = await res.json();
				if (res.ok && json.categories) {
					// Map id to _id for UI compatibility
					const normalized = json.categories.map((cat: any) => ({
						...cat,
						_id: cat.id || cat._id
					}));
					setCategories(normalized);
				}
			} catch (error) {
				console.error('Error loading categories:', error);
			}
		})();
	}, []);

	// Load packs
	useEffect(() => {
		(async () => {
			try {
				const token = localStorage.getItem('token');
				const headers: any = {};
				if (token) headers['Authorization'] = `Bearer ${token}`;
				
				const res = await fetch('/api/packs', { headers, credentials: 'include' });
				const json = await res.json();
				if (res.ok && json.packs) {
					// Map id to _id for UI compatibility
					const normalized = json.packs.map((pack: any) => ({
						...pack,
						_id: pack.id || pack._id
					}));
					setPacks(normalized);
				}
			} catch (error) {
				console.error('Error loading packs:', error);
			}
		})();
	}, []);

	const resetForm = () => {
		setForm({ name: '', description: '', price: '', categoryId: undefined, image: '', isAvailable: true, packId: undefined, priceDescription: '', isPublished: true });
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
		
		// Only swap if both items have IDs (are saved)
		if (!a?._id || !b?._id) {
			console.warn('Cannot reorder: one or both items are not saved yet');
			return;
		}
		
		[newItems[index], newItems[targetIndex]] = [b, a];
		setItems(newItems as any);
		
		// Persist their sortOrder (use target positions) - await both API calls
		try {
			const token = localStorage.getItem('token');
			const headers: any = { 'Content-Type': 'application/json' };
			if (token) headers['Authorization'] = `Bearer ${token}`;
			
			await Promise.all([
				fetch(`/api/menu/${a._id}`, { method: 'PATCH', headers, credentials: 'include', body: JSON.stringify({ sortOrder: targetIndex }) }),
				fetch(`/api/menu/${b._id}`, { method: 'PATCH', headers, credentials: 'include', body: JSON.stringify({ sortOrder: index }) })
			]);
		} catch (error) {
			console.error('Error updating item order:', error);
			// Revert on error
			setItems([...items]);
		}
	};

	const removeItem = async (index: number) => {
		try {
			const target: any = (items as any)[index];
			if (!target || !(target as any)._id) {
				// Optimistic local remove for unsaved item
				setItems(prev => prev.filter((_, i) => i !== index));
				return;
			}
			
			// Confirm deletion
			if (!confirm(`Are you sure you want to delete "${target.name}"? This action cannot be undone.`)) {
				return;
			}
			
			const id = (target as any)._id;
			const token = localStorage.getItem('token');
			const headers: any = {};
			if (token) headers['Authorization'] = `Bearer ${token}`;
			
			const res = await fetch(`/api/menu/${id}`, { method: 'DELETE', headers, credentials: 'include' });
			if (res.ok) {
				setItems(prev => prev.filter((_, i) => i !== index));
			} else {
				const json = await res.json();
				console.error('Failed to delete item:', json.message || 'Unknown error');
				setError(json.message || 'Failed to delete item');
			}
		} catch (error) {
			console.error('Error deleting item:', error);
			setError('Network error while deleting item');
		}
	};

	const saveItem = async () => {
		if (!form.name || !form.description || !form.categoryId || form.price === '' || form.price === 0) {
			setError('Please fill in all required fields');
			return;
		}
		
		// Basic validation
		if (typeof form.price === 'number' && form.price <= 0) {
			setError('Price must be greater than 0');
			return;
		}
		
		if (form.name.trim().length < 2) {
			setError('Item name must be at least 2 characters');
			return;
		}
		
		try {
			setLoading(true);
			setError('');
			const token = localStorage.getItem('token');
			const headers: any = { 'Content-Type': 'application/json' };
			if (token) headers['Authorization'] = `Bearer ${token}`;
			
			const numericPrice = typeof form.price === 'number' ? form.price : parseInt(String(form.price), 10);
			const payload: any = {
				name: form.name.trim(),
				description: form.description.trim(),
				price: numericPrice,
				priceDescription: form.priceDescription?.trim() || '',
				image: form.image || '',
				isAvailable: form.isAvailable,
				isPublished: form.isPublished!==false,
				categoryId: form.categoryId,
				packId: form.packId || undefined,
			};
			
			if (editIndex === null) {
				const res = await fetch('/api/menu', { method: 'POST', headers, credentials: 'include', body: JSON.stringify(payload) });
				const json = await res.json();
				if (res.ok) {
					setItems(prev => [{ ...json.item, _id: json.item.id || json.item._id }, ...prev]);
					resetForm();
				} else {
					setError(json.message || 'Failed to create menu item');
				}
			} else {
				const existing: any = (items as any)[editIndex];
				if (existing && existing._id) {
					const res = await fetch(`/api/menu/${existing._id}`, { method: 'PATCH', headers, credentials: 'include', body: JSON.stringify(payload) });
					const json = await res.json();
					if (res.ok) {
						setItems(prev => prev.map((it: any, i) => (i === editIndex ? { ...json.item, _id: json.item.id || json.item._id } : it)));
						resetForm();
					} else {
						setError(json.message || 'Failed to update menu item');
					}
				} else {
					// fallback create
					const res = await fetch('/api/menu', { method: 'POST', headers, credentials: 'include', body: JSON.stringify(payload) });
					const json = await res.json();
					if (res.ok) {
						setItems(prev => prev.map((it, i) => (i === editIndex ? { ...json.item, _id: json.item.id || json.item._id } : it)));
						resetForm();
					} else {
						setError(json.message || 'Failed to create menu item');
					}
				}
			}
		} catch (error: any) {
			console.error('Error saving menu item:', error);
			setError(error.message || 'Network error while saving item');
		} finally {
			setLoading(false);
		}
	};

	// Toggle item availability quickly
	const toggleItemAvailability = async (item: any) => {
		const itemId = item._id || item.id;
		if (!itemId) {
			console.error('Cannot toggle availability: item has no ID');
			return;
		}
		
		// Prevent multiple simultaneous toggles
		if (togglingItemId === itemId) {
			return;
		}
		
		const newAvailability = !item.isAvailable;
		setTogglingItemId(itemId);
		
		// Optimistic update - use item ID instead of index for reliability
		setItems(prev => prev.map((it: any) => {
			const currentId = (it as any)._id || (it as any).id;
			return currentId === itemId ? { ...it, isAvailable: newAvailability } : it;
		}));

		try {
			const token = localStorage.getItem('token');
			const headers: any = { 'Content-Type': 'application/json' };
			if (token) headers['Authorization'] = `Bearer ${token}`;
			
			const res = await fetch(`/api/menu/${itemId}`, {
				method: 'PATCH',
				headers,
				credentials: 'include',
				body: JSON.stringify({ isAvailable: newAvailability })
			});

			if (res.ok) {
				const json = await res.json();
				// Update with server response using item ID
				setItems(prev => prev.map((it: any) => {
					const currentId = (it as any)._id || (it as any).id;
					return currentId === itemId ? json.item : it;
				}));
			} else {
				// Revert on error
				setItems(prev => prev.map((it: any) => {
					const currentId = (it as any)._id || (it as any).id;
					return currentId === itemId ? { ...it, isAvailable: !newAvailability } : it;
				}));
			}
		} catch (error) {
			console.error('Error toggling item availability:', error);
			// Revert on error
			setItems(prev => prev.map((it: any) => {
				const currentId = (it as any)._id || (it as any).id;
				return currentId === itemId ? { ...it, isAvailable: !newAvailability } : it;
			}));
		} finally {
			setTogglingItemId(null);
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

				{/* Error Banner */}
				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
						<svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
						</svg>
						<div>
							<h3 className="text-sm font-medium text-red-800">Error Loading Menu</h3>
							<p className="text-sm text-red-700 mt-1">{error}</p>
						</div>
					</div>
				)}

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
						<input
							type="number"
							min={0}
							value={form.price}
							onChange={(e) => {
								const val = e.target.value;
								if (val === '') {
									setForm({ ...form, price: '' });
								} else {
									const parsed = parseInt(val, 10);
									setForm({ ...form, price: isNaN(parsed) ? '' : parsed });
								}
							}}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400"
							placeholder="2000"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Price description (optional)</label>
						<input value={form.priceDescription||''} onChange={(e)=> setForm({ ...form, priceDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" placeholder="per plate / per bowl" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
						<input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 placeholder-gray-400" placeholder="https://..." />
						<div className="mt-2 flex items-center gap-4">
							<input type="file" accept="image/*" onChange={async (e) => {
								const file = e.target.files?.[0];
								if (!file) return;
								try {
									setUploading(true);
									const token = localStorage.getItem('token');
									const fd = new FormData();
									fd.append('file', file);
									const headers: any = {};
									if (token) headers['Authorization'] = `Bearer ${token}`;
									
									const res = await fetch('/api/uploads', { method: 'POST', headers, body: fd });
									const json = await res.json();
									if (res.ok && json.url) {
										setForm(prev => ({ ...prev, image: json.url }));
									} else {
										console.error('Failed to upload image:', json.message || 'Unknown error');
									}
								} catch (error) {
									console.error('Error uploading image:', error);
								} finally {
									setUploading(false);
								}
							}} />
							{uploading && <span className="text-xs text-gray-500">Uploading...</span>}
							{!uploading && isValidImageUrl(form.image || '') && (
								<div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
									<img
										src={getImageUrl(form.image || '')}
										alt="Preview"
										className="w-full h-full object-cover"
										onError={(e) => {
											(e.target as HTMLImageElement).style.display = 'none';
										}}
									/>
								</div>
							)}
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

			{/* Quick Availability Control - Toggle all items on/off */}
			<div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 mb-5">
				<div className="flex items-center gap-2 mb-4">
					<Power className="h-5 w-5 text-brand-primary" />
					<h2 className="text-base sm:text-lg font-semibold text-gray-900">Quick Availability Control</h2>
				</div>
				<p className="text-sm text-gray-600 mb-4">Quickly toggle menu items on or off based on what's available in the kitchen</p>
				
				{items.length === 0 ? (
					<div className="text-center py-8 text-gray-500 text-sm">
						No menu items yet. Add items to manage availability.
					</div>
				) : (() => {
					// Helper function to get category ID from item
					const getItemCategoryId = (item: any): string | undefined => {
						return (item as any).categoryId || (item as any).category;
					};
					
					// Helper function to check if item belongs to a category
					const itemBelongsToCategory = (item: any, categoryId: string | undefined): boolean => {
						return getItemCategoryId(item) === categoryId;
					};
					
					// Helper function to check if item is uncategorized
					const isUncategorized = (item: any): boolean => {
						const catId = getItemCategoryId(item);
						return !categories.find(c => c._id === catId);
					};
					
					// Get categorized items grouped by category
					const categorizedItemsByCategory = categories.map(category => ({
						category,
						items: items.filter((item: any) => itemBelongsToCategory(item, category._id))
					})).filter(group => group.items.length > 0);
					
					// Get uncategorized items
					const uncategorizedItems = items.filter((item: any) => isUncategorized(item));
					
					return (
						<div className="space-y-4">
							{/* Group items by category */}
							{categorizedItemsByCategory.map(({ category, items: categoryItems }) => (
								<div key={category._id} className="border border-gray-200 rounded-lg p-4">
									<h3 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">{category.name}</h3>
									<div className="space-y-2">
										{categoryItems.map((item: any, itemIndex) => (
											<div key={(item as any)._id || itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h4>
														<span className="text-xs text-gray-500">₦{item.price.toLocaleString()}</span>
													</div>
													<p className="text-xs text-gray-600 truncate mt-0.5">{item.description}</p>
												</div>
												<button
													onClick={() => toggleItemAvailability(item)}
													disabled={togglingItemId === ((item as any)._id || (item as any).id)}
													className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
														item.isAvailable ? 'bg-green-600' : 'bg-gray-300'
													}`}
													aria-label={`Toggle ${item.name} availability`}
												>
													<span
														className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
															item.isAvailable ? 'translate-x-6' : 'translate-x-1'
														}`}
													/>
												</button>
											</div>
										))}
									</div>
								</div>
							))}

							{/* Items without category */}
							{uncategorizedItems.length > 0 && (
								<div className="border border-gray-200 rounded-lg p-4">
									<h3 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Uncategorized</h3>
									<div className="space-y-2">
										{uncategorizedItems.map((item: any, itemIndex) => (
											<div key={(item as any)._id || itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h4>
														<span className="text-xs text-gray-500">₦{item.price.toLocaleString()}</span>
													</div>
													<p className="text-xs text-gray-600 truncate mt-0.5">{item.description}</p>
												</div>
												<button
													onClick={() => toggleItemAvailability(item)}
													disabled={togglingItemId === ((item as any)._id || (item as any).id)}
													className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
														item.isAvailable ? 'bg-green-600' : 'bg-gray-300'
													}`}
													aria-label={`Toggle ${item.name} availability`}
												>
													<span
														className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
															item.isAvailable ? 'translate-x-6' : 'translate-x-1'
														}`}
													/>
												</button>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					);
				})()}
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
						onCreated={(cat) => {
							// Normalize category: ensure _id field exists
							const normalized = { ...cat, _id: cat.id || cat._id };
							setCategories(prev => [normalized, ...prev]);
						}}
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
											const token = localStorage.getItem('token');
											const headers: any = { 'Content-Type': 'application/json' };
											if (token) headers['Authorization'] = `Bearer ${token}`;
											
											const res = await fetch(`/api/categories/${cat._id}`, { method: 'PATCH', headers, credentials: 'include', body: JSON.stringify({ isActive: !cat.isActive }) });
											if (res.ok) setCategories(prev => prev.map((c, i) => i===idx ? { ...c, isActive: !c.isActive } : c));
										}} className={`px-3 py-1.5 rounded-lg text-sm ${cat.isActive?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{cat.isActive?'Published':'Unpublished'}</button>
										<button onClick={async () => {
											if (!cat._id) return;
											
											// Check if category has menu items before deletion
											const itemsInCategory = items.filter((item: any) => {
												const catId = (item as any).categoryId || (item as any).category;
												return catId === cat._id;
											});
											
											if (itemsInCategory.length > 0) {
												const confirmMsg = `This category has ${itemsInCategory.length} menu item(s). Deleting it will remove all items in this category. Are you sure?`;
												if (!confirm(confirmMsg)) return;
											}
											
											const token = localStorage.getItem('token');
											const headers: any = {};
											if (token) headers['Authorization'] = `Bearer ${token}`;
											
											const res = await fetch(`/api/categories/${cat._id}`, { method: 'DELETE', headers, credentials: 'include' });
											if (res.ok) {
												setCategories(prev => prev.filter((_, i) => i!==idx));
											} else {
												const json = await res.json();
												console.error('Failed to delete category:', json.message || 'Unknown error');
											}
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
					<PackEditor onCreated={(pack) => {
						// Normalize pack: ensure _id field exists
						const normalized = { ...pack, _id: pack.id || pack._id };
						setPacks(prev => [normalized, ...prev]);
					}} />
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
											const token = localStorage.getItem('token');
											const headers: any = { 'Content-Type': 'application/json' };
											if (token) headers['Authorization'] = `Bearer ${token}`;
											
											const res = await fetch(`/api/packs/${p._id}`, { method: 'PATCH', headers, credentials: 'include', body: JSON.stringify({ isActive: !p.isActive }) });
											if (res.ok) setPacks(prev => prev.map((x, i) => i===idx ? { ...x, isActive: !x.isActive } : x));
										}} className={`px-3 py-1.5 rounded-lg text-sm ${p.isActive?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{p.isActive?'Active':'Inactive'}</button>
										<button onClick={async () => {
											if (!p._id) return;
											
											// Confirm deletion
											if (!confirm(`Are you sure you want to delete pack "${p.name}"? This action cannot be undone.`)) {
												return;
											}
											
											const token = localStorage.getItem('token');
											const headers: any = {};
											if (token) headers['Authorization'] = `Bearer ${token}`;
											
											const res = await fetch(`/api/packs/${p._id}`, { method: 'DELETE', headers, credentials: 'include' });
											if (res.ok) {
												setPacks(prev => prev.filter((_, i) => i!==idx));
											} else {
												const json = await res.json();
												console.error('Failed to delete pack:', json.message || 'Unknown error');
											}
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
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ name, description, isActive })
      });
      const json = await res.json();
      if (res.ok && json.category) {
        onCreated(json.category);
        setName('');
        setDescription('');
        setIsActive(true);
      } else {
        console.error('Failed to create category:', json.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error creating category:', error);
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
			const token = localStorage.getItem('token');
			const headers: any = { 'Content-Type': 'application/json' };
			if (token) headers['Authorization'] = `Bearer ${token}`;
			
			const res = await fetch('/api/packs', { method: 'POST', headers, credentials: 'include', body: JSON.stringify({ name, description, price, isActive }) });
			const json = await res.json();
			if (res.ok && json.pack) {
				onCreated(json.pack);
				setName(''); setDescription(''); setPrice(0); setIsActive(true);
			} else {
				console.error('Failed to create pack:', json.message || 'Unknown error');
			}
		} catch (error) {
			console.error('Error creating pack:', error);
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
