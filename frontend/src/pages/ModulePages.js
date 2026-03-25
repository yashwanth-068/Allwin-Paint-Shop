import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getCategoryName,
  getStatusClass,
  getUnitName
} from '../utils/helpers';
import './ModulePages.css';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

const toDateInput = (date) => {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().split('T')[0];
};

const getNextOrderStatus = (status) => {
  const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusFlow.indexOf(status);
  if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
    return null;
  }
  return statusFlow[currentIndex + 1];
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getVirtualBillHtml = (sale) => {
  const items = sale?.items || [];
  const rows = items
    .map(
      (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.quantity)}</td>
        <td>${escapeHtml(formatCurrency(item.price))}</td>
        <td>${escapeHtml(formatCurrency(item.gst))}</td>
        <td>${escapeHtml(formatCurrency(item.total))}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Invoice ${escapeHtml(sale.billNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
      h1, h2, h3, p { margin: 0; }
      .header { display: flex; justify-content: space-between; margin-bottom: 18px; }
      .meta { margin-top: 10px; }
      .meta-row { margin: 4px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 13px; text-align: left; }
      th { background: #f3f4f6; }
      .totals { margin-top: 14px; width: 320px; margin-left: auto; }
      .total-row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 13px; }
      .total-main { font-weight: 700; font-size: 15px; border-top: 1px solid #d1d5db; padding-top: 8px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h2>All Win Paint Shop</h2>
        <p>Karur, Tamil Nadu</p>
      </div>
      <div>
        <h3>Invoice</h3>
        <p># ${escapeHtml(sale.billNumber)}</p>
      </div>
    </div>

    <div class="meta">
      <div class="meta-row"><strong>Customer:</strong> ${escapeHtml(sale.customer?.name)}</div>
      <div class="meta-row"><strong>Phone:</strong> ${escapeHtml(sale.customer?.phone)}</div>
      <div class="meta-row"><strong>Date:</strong> ${escapeHtml(formatDateTime(sale.createdAt))}</div>
      <div class="meta-row"><strong>Payment:</strong> ${escapeHtml(sale.paymentMethod)} (${escapeHtml(
    sale.paymentStatus
  )})</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>GST</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>${escapeHtml(formatCurrency(sale.subtotal))}</span></div>
      <div class="total-row"><span>GST</span><span>${escapeHtml(formatCurrency(sale.gstTotal))}</span></div>
      <div class="total-row"><span>Discount</span><span>${escapeHtml(formatCurrency(sale.discount || 0))}</span></div>
      <div class="total-row total-main"><span>Grand Total</span><span>${escapeHtml(
        formatCurrency(sale.totalAmount)
      )}</span></div>
      <div class="total-row"><span>Amount Paid</span><span>${escapeHtml(formatCurrency(sale.amountPaid || 0))}</span></div>
      <div class="total-row"><span>Credit Balance</span><span>${escapeHtml(
        formatCurrency(sale.creditAmount || 0)
      )}</span></div>
    </div>
    <script>
      if (window.location.hash === '#print') {
        window.addEventListener('load', function () {
          setTimeout(function () { window.print(); }, 250);
        });
      }
    </script>
  </body>
</html>`;
};

const openVirtualBillCopy = (sale, autoPrint = false) => {
  if (!sale) {
    return;
  }

  const html = getVirtualBillHtml(sale);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const popup = window.open(autoPrint ? `${url}#print` : url, '_blank', 'width=1000,height=900');
  if (!popup) {
    URL.revokeObjectURL(url);
    toast.error('Please allow popups to view the virtual copy');
    return;
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

const PanelLoader = () => (
  <div className="module-loading">
    <div className="spinner"></div>
  </div>
);

const EmptyPanel = ({ title }) => (
  <div className="module-empty">
    <h3>{title}</h3>
  </div>
);

export const ProductsModulePage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paintProductId, setPaintProductId] = useState('');
  const [paintHex, setPaintHex] = useState('#ff7a18');
  const [savingPaint, setSavingPaint] = useState(false);
  const [creating, setCreating] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUpdateId, setImageUpdateId] = useState('');
  const [imageUpdateUrl, setImageUpdateUrl] = useState('');
  const [imageUpdatePreview, setImageUpdatePreview] = useState('');
  const [updatingImage, setUpdatingImage] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    price: '',
    category: 'paints',
    unit: 'liter',
    stock: '',
    minStock: 10,
    gst: 18,
    discount: 0,
    description: '',
    imageUrl: '',
    imageData: ''
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'paints', label: 'Paints' },
    { value: 'cement', label: 'Cement' },
    { value: 'steel_bars', label: 'Steel Bars' },
    { value: 'tools', label: 'Tools' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const fetchProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      params.set('sort', '-createdAt');
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch products'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const paintProducts = useMemo(
    () => products.filter((product) => product.category === 'paints'),
    [products]
  );

  const selectedPaint = useMemo(
    () => paintProducts.find((product) => product._id === paintProductId),
    [paintProducts, paintProductId]
  );

  const selectedImageProduct = useMemo(
    () => products.find((product) => product._id === imageUpdateId),
    [products, imageUpdateId]
  );

  useEffect(() => {
    if (paintProducts.length && !paintProductId) {
      setPaintProductId(paintProducts[0]._id);
    }
  }, [paintProducts, paintProductId]);

  useEffect(() => {
    if (products.length && !imageUpdateId) {
      setImageUpdateId(products[0]._id);
    }
  }, [products, imageUpdateId]);

  useEffect(() => {
    if (!selectedImageProduct) {
      return;
    }
    const currentImage = selectedImageProduct.images?.[0] || '';
    setImageUpdateUrl(currentImage);
    setImageUpdatePreview('');
  }, [selectedImageProduct]);

  useEffect(() => {
    if (!selectedPaint) return;
    setPaintHex(selectedPaint.specifications?.color || '#ff7a18');
  }, [selectedPaint]);

  const lowStockCount = useMemo(
    () => products.filter((product) => product.stock <= product.minStock).length,
    [products]
  );

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    fetchProducts(true);
  };

  const handlePaintHexInput = (value) => {
    const next = value.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(next)) {
      setPaintHex(next);
    }
  };

  const handleCopyHex = async () => {
    try {
      await navigator.clipboard.writeText(paintHex);
      toast.success('Color code copied');
    } catch (error) {
      toast.error('Unable to copy color code');
    }
  };

  const handleSavePaintColor = async () => {
    if (!paintProductId) {
      toast.error('Select a paint product');
      return;
    }

    setSavingPaint(true);
    try {
      const payload = {
        specifications: {
          ...(selectedPaint?.specifications || {}),
          color: paintHex
        }
      };

      const response = await api.put(`/products/${paintProductId}`, payload);
      const updated = response.data.data;

      setProducts((prev) => prev.map((product) => (product._id === updated._id ? updated : product)));
      toast.success('Paint color code saved');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save paint color'));
    } finally {
      setSavingPaint(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() || '';
      setImagePreview(result);
      setNewProduct((prev) => ({ ...prev, imageData: result, imageUrl: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpdateUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString() || '';
      setImageUpdatePreview(result);
      setImageUpdateUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();

    if (!newProduct.name.trim() || !newProduct.brand.trim() || !newProduct.price || !newProduct.description.trim()) {
      toast.error('Name, brand, price, and description are required');
      return;
    }

    const imagePayload = newProduct.imageData || newProduct.imageUrl.trim();
    if (!imagePayload) {
      toast.error('Add at least one product image');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: newProduct.name.trim(),
        brand: newProduct.brand.trim(),
        price: Number(newProduct.price),
        category: newProduct.category,
        unit: newProduct.unit,
        stock: Number(newProduct.stock || 0),
        minStock: Number(newProduct.minStock || 0),
        gst: Number(newProduct.gst || 0),
        discount: Number(newProduct.discount || 0),
        description: newProduct.description.trim(),
        images: [imagePayload]
      };

      const response = await api.post('/products', payload);
      const created = response.data.data;
      setProducts((prev) => [created, ...prev]);
      toast.success('Product added successfully');
      setNewProduct({
        name: '',
        brand: '',
        price: '',
        category: 'paints',
        unit: 'liter',
        stock: '',
        minStock: 10,
        gst: 18,
        discount: 0,
        description: '',
        imageUrl: '',
        imageData: ''
      });
      setImagePreview('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add product'));
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateProductImage = async (event) => {
    event.preventDefault();
    if (!imageUpdateId) {
      toast.error('Select a product');
      return;
    }

    const imagePayload = imageUpdatePreview || imageUpdateUrl.trim();
    if (!imagePayload) {
      toast.error('Provide an image URL or upload a file');
      return;
    }

    setUpdatingImage(true);
    try {
      const response = await api.put(`/products/${imageUpdateId}`, { images: [imagePayload] });
      const updated = response.data.data;
      setProducts((prev) => prev.map((product) => (product._id === updated._id ? updated : product)));
      toast.success('Product image updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update image'));
    } finally {
      setUpdatingImage(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!imageUpdateId) {
      toast.error('Select a product');
      return;
    }

    const productName = selectedImageProduct?.name || 'this product';
    const confirmed = window.confirm(`Delete ${productName}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setDeletingProduct(true);
    try {
      await api.delete(`/products/${imageUpdateId}`);
      const updated = products.filter((product) => product._id !== imageUpdateId);
      setProducts(updated);

      const nextImageId = updated[0]?._id || '';
      setImageUpdateId(nextImageId);

      if (paintProductId === imageUpdateId) {
        const nextPaintId = updated.find((product) => product.category === 'paints')?._id || '';
        setPaintProductId(nextPaintId);
      }

      toast.success('Product deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete product'));
    } finally {
      setDeletingProduct(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Products</h1>
          <p>{products.length} products listed</p>
        </div>
        <div className="module-actions">
          <button className="btn btn-outline btn-sm" onClick={() => fetchProducts(true)} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="module-kpi-grid">
        <div className="module-kpi-card">
          <span className="module-kpi-label">Total Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="module-kpi-card">
          <span className="module-kpi-label">Low Stock</span>
          <strong>{lowStockCount}</strong>
        </div>
      </div>

      <div className="card product-create-card">
        <div className="card-header">
          <h3>Add New Product</h3>
          <p className="module-muted">Upload image, set brand, and price for new inventory items.</p>
        </div>
        <div className="card-body">
          <form className="product-create-form" onSubmit={handleCreateProduct}>
            <div className="product-create-grid">
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  className="form-input"
                  value={newProduct.name}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Enter product name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  className="form-input"
                  value={newProduct.brand}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, brand: event.target.value }))}
                  placeholder="Brand name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={newProduct.category}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, category: event.target.value }))}
                >
                  {categories.filter((option) => option.value).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select
                  className="form-select"
                  value={newProduct.unit}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, unit: event.target.value }))}
                >
                  <option value="liter">Liter</option>
                  <option value="bag">Bag</option>
                  <option value="kg">Kg</option>
                  <option value="piece">Piece</option>
                  <option value="bundle">Bundle</option>
                  <option value="sq_ft">Sq Ft</option>
                  <option value="ton">Ton</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={newProduct.price}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, price: event.target.value }))}
                  placeholder="₹"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={newProduct.stock}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, stock: event.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Min Stock</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={newProduct.minStock}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, minStock: event.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">GST %</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={newProduct.gst}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, gst: event.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Discount %</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={newProduct.discount}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, discount: event.target.value }))}
                />
              </div>
              <div className="form-group product-create-description">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={newProduct.description}
                  onChange={(event) => setNewProduct((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Short product description"
                />
              </div>
            </div>

            <div className="product-create-media">
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  className="form-input"
                  value={newProduct.imageUrl}
                  onChange={(event) =>
                    setNewProduct((prev) => ({ ...prev, imageUrl: event.target.value, imageData: '' }))
                  }
                  placeholder="https://image-link"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Or Upload Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
              <div className="product-create-preview">
                <div className="module-muted">Preview</div>
                <div className="product-create-image">
                  {imagePreview || newProduct.imageUrl ? (
                    <img src={imagePreview || newProduct.imageUrl} alt="Preview" />
                  ) : (
                    <span>No image selected</span>
                  )}
                </div>
              </div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>

      <div className="card product-image-card">
        <div className="card-header">
          <h3>Update Product Image</h3>
          <p className="module-muted">Replace inaccurate product photos for buyers.</p>
        </div>
        <div className="card-body">
          <div className="product-update-grid">
            <form className="product-image-form" onSubmit={handleUpdateProductImage}>
              <div className="product-image-grid">
                <div className="form-group">
                  <label className="form-label">Select Product</label>
                  <select
                    className="form-select"
                    value={imageUpdateId}
                    onChange={(event) => setImageUpdateId(event.target.value)}
                  >
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    className="form-input"
                    value={imageUpdateUrl}
                    onChange={(event) => {
                      setImageUpdateUrl(event.target.value);
                      setImageUpdatePreview('');
                    }}
                    placeholder="https://image-link"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Or Upload Image</label>
                  <input type="file" accept="image/*" onChange={handleImageUpdateUpload} />
                </div>
              </div>

              <div className="product-image-preview">
                <div className="module-muted">Preview</div>
                <div className="product-create-image">
                  {imageUpdatePreview || imageUpdateUrl ? (
                    <img src={imageUpdatePreview || imageUpdateUrl} alt="Preview" />
                  ) : (
                    <span>No image selected</span>
                  )}
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={updatingImage}>
                {updatingImage ? 'Updating...' : 'Update Image'}
              </button>
            </form>

            <div className="product-delete-panel">
              <div>
                <h4>Delete Product</h4>
                <p className="module-muted">Removes the product from the store and inventory lists.</p>
              </div>
              <div className="product-delete-info">
                <strong>{selectedImageProduct?.name || 'Select a product'}</strong>
                <span>{selectedImageProduct?.brand || ''}</span>
                {selectedImageProduct?.price ? (
                  <span>{formatCurrency(selectedImageProduct.price)}</span>
                ) : (
                  <span className="module-muted">No price set</span>
                )}
              </div>
              <button className="btn btn-danger" type="button" onClick={handleDeleteProduct} disabled={deletingProduct}>
                {deletingProduct ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="paint-lab">
        <div className="paint-lab-header">
          <div>
            <div className="paint-lab-title">Paint Color Lab</div>
            <div className="module-muted">
              Pick a color code for mixing and store it on paint products for quick reference.
            </div>
          </div>
          <div className="paint-lab-actions">
            <button className="btn btn-outline btn-sm" onClick={handleCopyHex}>
              Copy HEX
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSavePaintColor}
              disabled={savingPaint || !paintProductId}
            >
              {savingPaint ? 'Saving...' : 'Save to Product'}
            </button>
          </div>
        </div>
        <div className="paint-lab-grid">
          <div>
            <label className="form-label">Paint Product</label>
            <select
              className="form-select"
              value={paintProductId}
              onChange={(event) => setPaintProductId(event.target.value)}
            >
              {paintProducts.length === 0 ? (
                <option value="">No paint products available</option>
              ) : (
                paintProducts.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="form-label">Pick Color</label>
            <input
              type="color"
              value={paintHex}
              onChange={(event) => setPaintHex(event.target.value)}
              className="form-input"
              style={{ height: '46px', padding: '0.25rem' }}
            />
            <input
              type="text"
              value={paintHex}
              onChange={(event) => handlePaintHexInput(event.target.value)}
              className="form-input"
              placeholder="#ff7a18"
              style={{ marginTop: '0.75rem' }}
            />
          </div>
          <div>
            <label className="form-label">Preview</label>
            <div className="paint-lab-swatch" style={{ background: paintHex }} />
            <div className="paint-lab-meta">Current code: {paintHex}</div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Product Catalog</h3>
          <form className="module-filter-row" onSubmit={handleSearchSubmit}>
            <input
              className="form-input"
              placeholder="Search by name or brand"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select className="form-select" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <PanelLoader />
        ) : products.length === 0 ? (
          <EmptyPanel title="No products found for this filter." />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="font-semibold">{product.name}</div>
                      <small className="text-gray-500">{getUnitName(product.unit)}</small>
                    </td>
                    <td>{getCategoryName(product.category)}</td>
                    <td>{product.brand}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>
                      {product.stock}
                      <small className="module-muted"> Min: {product.minStock}</small>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          !product.isActive
                            ? 'badge-danger'
                            : product.stock <= product.minStock
                            ? 'badge-warning'
                            : 'badge-success'
                        }`}
                      >
                        {!product.isActive ? 'Inactive' : product.stock <= product.minStock ? 'Low stock' : 'In stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const OrdersModulePage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  const hasColorCodes = useMemo(
    () => orders.some((order) => order.items?.some((item) => item.colorCode)),
    [orders]
  );

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (statusFilter) params.set('status', statusFilter);
      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusUpdate = async (orderId, nextStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, {
        status: nextStatus,
        note: `Status updated to ${nextStatus}`
      });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update order'));
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Orders</h1>
          <p>Manage and process incoming orders</p>
        </div>
        <div className="module-actions">
          <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="btn btn-outline btn-sm" onClick={fetchOrders}>
            Refresh
          </button>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <PanelLoader />
        ) : orders.length === 0 ? (
          <EmptyPanel title="No orders available right now." />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  {hasColorCodes && <th>Paint Codes</th>}
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const nextStatus = getNextOrderStatus(order.orderStatus);
                  const paintCodes = order.items
                    ?.filter((item) => item.colorCode)
                    .map((item) => `${item.name}: ${item.colorCode}`);
                  return (
                    <tr key={order._id}>
                      <td>{order.orderNumber}</td>
                      <td>
                        <div>{order.user?.name || 'Guest'}</div>
                        <small className="text-gray-500">{order.user?.phone || '-'}</small>
                      </td>
                      {hasColorCodes && (
                        <td>
                          {paintCodes?.length ? (
                            <div className="module-muted">
                              {paintCodes.map((code, index) => (
                                <div key={`${order._id}-code-${index}`}>{code}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="module-muted">-</span>
                          )}
                        </td>
                      )}
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span className={`badge ${getStatusClass(order.paymentStatus)}`}>{order.paymentStatus}</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusClass(order.orderStatus)}`}>{order.orderStatus}</span>
                      </td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>
                        <div className="module-action-buttons">
                          {nextStatus && order.orderStatus !== 'cancelled' ? (
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={updatingId === order._id}
                              onClick={() => handleStatusUpdate(order._id, nextStatus)}
                            >
                              {updatingId === order._id ? 'Updating...' : `Mark ${nextStatus}`}
                            </button>
                          ) : (
                            <span className="module-muted">No action</span>
                          )}
                          {['pending', 'confirmed'].includes(order.orderStatus) && (
                            <button
                              className="btn btn-outline btn-sm"
                              disabled={updatingId === order._id}
                              onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const SalesModulePage = () => {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ totalSalesAmount: 0, totalCredit: 0, salesCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sales?limit=100');
      setSales(response.data.data || []);
      setSummary(response.data.summary || { totalSalesAmount: 0, totalCredit: 0, salesCount: 0 });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch sales'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Sales</h1>
          <p>Track all online and counter sales</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchSales}>
          Refresh
        </button>
      </div>

      <div className="module-kpi-grid">
        <div className="module-kpi-card">
          <span className="module-kpi-label">Total Sales</span>
          <strong>{formatCurrency(summary.totalSalesAmount || 0)}</strong>
        </div>
        <div className="module-kpi-card">
          <span className="module-kpi-label">Credit Pending</span>
          <strong>{formatCurrency(summary.totalCredit || 0)}</strong>
        </div>
        <div className="module-kpi-card">
          <span className="module-kpi-label">Bills</span>
          <strong>{summary.salesCount || 0}</strong>
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <PanelLoader />
        ) : sales.length === 0 ? (
          <EmptyPanel title="No sales records yet." />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Billed By</th>
                  <th>Date</th>
                  <th>Virtual Copy</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>{sale.billNumber}</td>
                    <td>{sale.customer?.name || 'N/A'}</td>
                    <td>{sale.saleType}</td>
                    <td>{formatCurrency(sale.totalAmount)}</td>
                    <td>
                      <span className={`badge ${getStatusClass(sale.paymentStatus)}`}>{sale.paymentStatus}</span>
                    </td>
                    <td>{sale.billedBy?.name || '-'}</td>
                    <td>{formatDateTime(sale.createdAt)}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openVirtualBillCopy(sale, false)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const InventoryModulePage = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [stockValues, setStockValues] = useState({});
  const [priceValues, setPriceValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [productsResponse, lowStockResponse] = await Promise.all([
        api.get('/products?limit=200&sort=stock'),
        api.get('/products/inventory/lowstock')
      ]);
      const productRows = productsResponse.data.data || [];
      setProducts(productRows);
      setLowStockProducts(lowStockResponse.data.data || []);
      setStockValues(
        productRows.reduce((acc, product) => {
          acc[product._id] = product.stock;
          return acc;
        }, {})
      );
      setPriceValues(
        productRows.reduce((acc, product) => {
          acc[product._id] = product.price;
          return acc;
        }, {})
      );
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch inventory'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = async (productId) => {
    const quantity = Number(stockValues[productId]);
    if (Number.isNaN(quantity) || quantity < 0) {
      toast.error('Stock must be zero or a positive number');
      return;
    }

    setUpdatingId(productId);
    try {
      await api.put(`/products/${productId}/stock`, { quantity, operation: 'set' });
      toast.success('Stock updated');
      fetchInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update stock'));
    } finally {
      setUpdatingId('');
    }
  };

  const handlePriceChange = async (productId) => {
    const nextPrice = Number(priceValues[productId]);
    if (Number.isNaN(nextPrice) || nextPrice < 0) {
      toast.error('Price must be zero or a positive number');
      return;
    }

    setUpdatingId(productId);
    try {
      await api.put(`/products/${productId}`, { price: nextPrice });
      toast.success('Price updated');
      fetchInventory();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update price'));
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Inventory</h1>
          <p>Monitor stock and update quantities</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchInventory}>
          Refresh
        </button>
      </div>

      <div className="module-kpi-grid">
        <div className="module-kpi-card">
          <span className="module-kpi-label">Tracked Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="module-kpi-card">
          <span className="module-kpi-label">Low Stock Alerts</span>
          <strong>{lowStockProducts.length}</strong>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>Stock Levels</h3>
        </div>
        {loading ? (
          <PanelLoader />
        ) : products.length === 0 ? (
          <EmptyPanel title="No inventory items available." />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current</th>
                  <th>Price</th>
                  <th>Min</th>
                  <th>Set Stock</th>
                  <th>Set Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{getCategoryName(product.category)}</td>
                    <td>{product.stock}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.minStock}</td>
                    <td>
                      <div className="module-inline-form">
                        <input
                          type="number"
                          min="0"
                          className="form-input"
                          value={stockValues[product._id] ?? ''}
                          onChange={(event) =>
                            setStockValues((previous) => ({
                              ...previous,
                              [product._id]: event.target.value
                            }))
                          }
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStockChange(product._id)}
                          disabled={updatingId === product._id}
                        >
                          {updatingId === product._id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="module-inline-form">
                        <input
                          type="number"
                          min="0"
                          className="form-input"
                          value={priceValues[product._id] ?? ''}
                          onChange={(event) =>
                            setPriceValues((previous) => ({
                              ...previous,
                              [product._id]: event.target.value
                            }))
                          }
                        />
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handlePriceChange(product._id)}
                          disabled={updatingId === product._id}
                        >
                          {updatingId === product._id ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${product.stock <= product.minStock ? 'badge-warning' : 'badge-success'}`}>
                        {product.stock <= product.minStock ? 'Low' : 'Healthy'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const BillingModulePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [createdBill, setCreatedBill] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    productId: '',
    quantity: 1,
    paymentMethod: 'cash',
    amountPaid: ''
  });

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === formData.productId),
    [products, formData.productId]
  );

  const billPreview = useMemo(() => {
    if (!selectedProduct) {
      return {
        subtotal: 0,
        gstTotal: 0,
        total: 0
      };
    }

    const quantity = Number(formData.quantity) || 0;
    const discountedPrice = selectedProduct.price - (selectedProduct.price * selectedProduct.discount) / 100;
    const subtotal = discountedPrice * quantity;
    const gstTotal = (subtotal * selectedProduct.gst) / 100;
    const total = subtotal + gstTotal;

    return { subtotal, gstTotal, total };
  }, [selectedProduct, formData.quantity]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products?limit=100&sort=name');
      const productRows = response.data.data || [];
      setProducts(productRows);
      if (productRows.length && !formData.productId) {
        setFormData((previous) => ({ ...previous, productId: productRows[0]._id }));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.customerName.trim() || !formData.customerPhone.trim() || !formData.productId) {
      toast.error('Customer and product details are required');
      return;
    }

    const quantity = Number(formData.quantity);
    if (Number.isNaN(quantity) || quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    const amountPaid = formData.amountPaid === '' ? billPreview.total : Number(formData.amountPaid);
    if (Number.isNaN(amountPaid) || amountPaid < 0 || amountPaid > billPreview.total) {
      toast.error('Amount paid must be between 0 and total bill');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/sales', {
        customer: {
          name: formData.customerName.trim(),
          phone: formData.customerPhone.trim()
        },
        items: [{ productId: formData.productId, quantity }],
        paymentMethod: formData.paymentMethod,
        discount: 0,
        amountPaid
      });

      toast.success('Bill created successfully');
      setCreatedBill(response.data.data);
      setFormData((previous) => ({
        ...previous,
        customerName: '',
        customerPhone: '',
        quantity: 1,
        amountPaid: ''
      }));
      fetchProducts();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create bill'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Counter Billing</h1>
          <p>Create walk-in customer bills</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <PanelLoader />
          ) : (
            <form className="module-billing-form" onSubmit={handleSubmit}>
              <div className="module-form-grid">
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input
                    className="form-input"
                    value={formData.customerName}
                    onChange={(event) => setFormData((previous) => ({ ...previous, customerName: event.target.value }))}
                    placeholder="Walk-in customer"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Phone</label>
                  <input
                    className="form-input"
                    value={formData.customerPhone}
                    onChange={(event) => setFormData((previous) => ({ ...previous, customerPhone: event.target.value }))}
                    placeholder="10 digit phone"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Product</label>
                  <select
                    className="form-select"
                    value={formData.productId}
                    onChange={(event) => setFormData((previous) => ({ ...previous, productId: event.target.value }))}
                  >
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.stock} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.quantity}
                    onChange={(event) => setFormData((previous) => ({ ...previous, quantity: event.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(event) => setFormData((previous) => ({ ...previous, paymentMethod: event.target.value }))}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount Paid</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.amountPaid}
                    onChange={(event) => setFormData((previous) => ({ ...previous, amountPaid: event.target.value }))}
                    placeholder={`Default: ${Math.round(billPreview.total)}`}
                  />
                </div>
              </div>

              <div className="module-billing-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(billPreview.subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>GST</span>
                  <span>{formatCurrency(billPreview.gstTotal)}</span>
                </div>
                <div className="summary-row summary-total">
                  <span>Total</span>
                  <span>{formatCurrency(billPreview.total)}</span>
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Creating Bill...' : 'Create Bill'}
              </button>
            </form>
          )}
        </div>
      </div>

      {createdBill && (
        <div className="card module-copy-card">
          <div className="card-body">
            <div className="module-copy-header">
              <div>
                <h3>Bill Created: {createdBill.billNumber}</h3>
                <p className="module-muted">
                  {createdBill.customer?.name} | {formatCurrency(createdBill.totalAmount)} |{' '}
                  {formatDateTime(createdBill.createdAt)}
                </p>
              </div>
              <div className="module-action-buttons">
                <button className="btn btn-outline btn-sm" onClick={() => openVirtualBillCopy(createdBill, false)}>
                  View Virtual Copy
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => openVirtualBillCopy(createdBill, true)}>
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const UsersModulePage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (targetUser) => {
    setUpdatingId(targetUser._id);
    try {
      await api.put(`/auth/users/${targetUser._id}/status`, { isActive: !targetUser.isActive });
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update user status'));
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Users</h1>
          <p>Manage owner, manager, and buyer accounts</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchUsers}>
          Refresh
        </button>
      </div>

      <div className="table-card">
        {loading ? (
          <PanelLoader />
        ) : users.length === 0 ? (
          <EmptyPanel title="No users found." />
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row._id}>
                    <td>{row.name}</td>
                    <td>{row.email}</td>
                    <td>
                      <span className="badge badge-primary">{row.role}</span>
                    </td>
                    <td>{row.phone}</td>
                    <td>
                      <span className={`badge ${row.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {row.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>
                      {row._id === user?.id || row._id === user?._id ? (
                        <span className="module-muted">Current user</span>
                      ) : (
                        <button
                          className="btn btn-outline btn-sm"
                          disabled={updatingId === row._id}
                          onClick={() => handleStatusToggle(row)}
                        >
                          {updatingId === row._id ? 'Updating...' : row.isActive ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export const ReportsModulePage = () => {
  const [groupBy, setGroupBy] = useState('day');
  const [startDate, setStartDate] = useState(toDateInput(new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)));
  const [endDate, setEndDate] = useState(toDateInput(new Date()));
  const [loading, setLoading] = useState(true);
  const [reportRows, setReportRows] = useState([]);
  const [categoryRows, setCategoryRows] = useState([]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('startDate', startDate);
      params.set('endDate', endDate);
      params.set('groupBy', groupBy);

      const response = await api.get(`/sales/reports/summary?${params.toString()}`);
      const payload = response.data.data || {};
      setReportRows(payload.salesReport || []);
      setCategoryRows(payload.categoryReport || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to fetch reports'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Reports</h1>
          <p>Sales summary by period and product category</p>
        </div>
      </div>

      <div className="card module-report-filters">
        <div className="card-body module-filter-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-input" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input type="date" className="form-input" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Group By</label>
            <select className="form-select" value={groupBy} onChange={(event) => setGroupBy(event.target.value)}>
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <button className="btn btn-primary module-filter-btn" onClick={fetchReport}>
            Generate
          </button>
        </div>
      </div>

      <div className="tables-grid">
        <div className="table-card">
          <div className="table-header">
            <h3>Time Series</h3>
          </div>
          {loading ? (
            <PanelLoader />
          ) : reportRows.length === 0 ? (
            <EmptyPanel title="No report data for this date range." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Sales</th>
                    <th>GST</th>
                    <th>Discount</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.map((row) => (
                    <tr key={row._id}>
                      <td>{row._id}</td>
                      <td>{formatCurrency(row.totalSales)}</td>
                      <td>{formatCurrency(row.totalGST)}</td>
                      <td>{formatCurrency(row.totalDiscount)}</td>
                      <td>{row.salesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="table-card">
          <div className="table-header">
            <h3>Category Summary</h3>
          </div>
          {loading ? (
            <PanelLoader />
          ) : categoryRows.length === 0 ? (
            <EmptyPanel title="No category data available." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Sales</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryRows.map((row) => (
                    <tr key={row._id || 'uncategorized'}>
                      <td>{row._id ? getCategoryName(row._id) : 'Uncategorized'}</td>
                      <td>{formatCurrency(row.totalSales)}</td>
                      <td>{row.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SettingsModulePage = () => {
  const { user, updateProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: 'Karur',
    state: 'Tamil Nadu',
    pincode: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || 'Karur',
      state: user.address?.state || 'Tamil Nadu',
      pincode: user.address?.pincode || ''
    });
  }, [user]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode
        }
      });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update profile'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Enter both current and new password');
      return;
    }
    setSavingPassword(true);
    try {
      const response = await api.put('/auth/updatepassword', passwordForm);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update password'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <h1>Settings</h1>
          <p>Update profile and account security</p>
        </div>
      </div>

      <div className="module-settings-grid">
        <div className="card">
          <div className="card-header">
            <h3>Profile Details</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleProfileSubmit}>
              <div className="module-form-grid">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-input"
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, name: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, phone: event.target.value }))}
                  />
                </div>
                <div className="form-group module-full-row">
                  <label className="form-label">Street</label>
                  <input
                    className="form-input"
                    value={profileForm.street}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, street: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    className="form-input"
                    value={profileForm.city}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, city: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    className="form-input"
                    value={profileForm.state}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, state: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    className="form-input"
                    value={profileForm.pincode}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, pincode: event.target.value }))}
                  />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Change Password</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((previous) => ({ ...previous, currentPassword: event.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((previous) => ({ ...previous, newPassword: event.target.value }))}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
