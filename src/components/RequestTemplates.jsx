import React, { useState } from 'react';
import { Button } from './ui/Button';
import { LayoutTemplate, X, Zap } from 'lucide-react';

const REQUEST_TEMPLATES = [
  {
    id: 'get-user',
    name: 'Get User',
    description: 'Retrieve user information',
    method: 'GET',
    url: '/api/users/{id}',
    headers: [
      { key: 'Authorization', value: 'Bearer {token}', enabled: true },
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    params: [
      { key: 'id', value: '123', enabled: true },
      { key: 'include', value: 'profile,preferences', enabled: true }
    ],
    body: '',
    category: 'users'
  },
  {
    id: 'create-post',
    name: 'Create Post',
    description: 'Create a new blog post',
    method: 'POST',
    url: '/api/posts',
    headers: [
      { key: 'Authorization', value: 'Bearer {token}', enabled: true },
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    params: [],
    body: JSON.stringify({
      title: 'Sample Post',
      content: 'This is a sample post content',
      author: '{userId}',
      tags: ['sample', 'api']
    }, null, 2),
    category: 'content'
  },
  {
    id: 'update-profile',
    name: 'Update Profile',
    description: 'Update user profile information',
    method: 'PUT',
    url: '/api/users/profile',
    headers: [
      { key: 'Authorization', value: 'Bearer {token}', enabled: true },
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    params: [],
    body: JSON.stringify({
      name: '{name}',
      email: '{email}',
      bio: 'Updated bio information',
      preferences: {
        theme: 'dark',
        notifications: true
      }
    }, null, 2),
    category: 'users'
  },
  {
    id: 'upload-file',
    name: 'Upload File',
    description: 'Upload a file with multipart form data',
    method: 'POST',
    url: '/api/upload',
    headers: [
      { key: 'Authorization', value: 'Bearer {token}', enabled: true }
    ],
    params: [
      { key: 'folder', value: 'documents', enabled: true }
    ],
    body: 'File upload - use form-data in body tab',
    category: 'files'
  },
  {
    id: 'webhook-test',
    name: 'Webhook Test',
    description: 'Test webhook endpoint',
    method: 'POST',
    url: '/api/webhooks/test',
    headers: [
      { key: 'X-Webhook-Secret', value: '{webhookSecret}', enabled: true },
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ],
    params: [],
    body: JSON.stringify({
      event: 'test.webhook',
      timestamp: new Date().toISOString(),
      data: {
        message: 'Webhook test payload',
        id: '{randomId}'
      }
    }, null, 2),
    category: 'webhooks'
  }
];

const RequestTemplates = ({ onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', ...new Set(REQUEST_TEMPLATES.map(t => t.category))];

  const filteredTemplates = REQUEST_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const applyTemplate = (template) => {
    const processedTemplate = {
      ...template,
      url: template.url.replace(/\{([^}]+)\}/g, (match, varName) => {
        const samples = {
          id: '123',
          token: 'your-jwt-token-here',
          userId: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          webhookSecret: 'whsec_your_webhook_secret',
          randomId: Math.random().toString(36).substr(2, 9)
        };
        return samples[varName] || match;
      }),
      headers: template.headers.map(header => ({
        ...header,
        value: header.value.replace(/\{([^}]+)\}/g, (match, varName) => {
          const samples = {
            token: 'your-jwt-token-here',
            webhookSecret: 'whsec_your_webhook_secret'
          };
          return samples[varName] || match;
        })
      })),
      params: template.params.map(param => ({
        ...param,
        value: param.value.replace(/\{([^}]+)\}/g, (match, varName) => {
          const samples = {
            id: '123',
            userId: 'user123',
            randomId: Math.random().toString(36).substr(2, 9)
          };
          return samples[varName] || match;
        })
      })),
      body: template.body.replace(/\{([^}]+)\}/g, (match, varName) => {
        const samples = {
          userId: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          randomId: Math.random().toString(36).substr(2, 9),
          token: 'your-jwt-token-here',
          webhookSecret: 'whsec_your_webhook_secret'
        };
        return samples[varName] || match;
      })
    };

    onSelectTemplate(processedTemplate);
    onClose();
  };

  const methodColors = {
    GET: 'text-emerald-500 bg-emerald-500/10',
    POST: 'text-blue-500 bg-blue-500/10',
    PUT: 'text-amber-500 bg-amber-500/10',
    PATCH: 'text-orange-500 bg-orange-500/10',
    DELETE: 'text-red-500 bg-red-500/10',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-sm shadow-lg max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <LayoutTemplate size={18} className="text-primary" />
            <span className="font-medium">Request Templates</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-border">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 bg-transparent border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ring mb-3"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="border border-border rounded-sm p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => applyTemplate(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-sm text-xs font-medium ${methodColors[template.method]}`}>
                    {template.method}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground font-mono truncate mb-2">
                  {template.url}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap size={12} />
                    {template.category}
                  </span>
                  <span className="text-primary">Use</span>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <LayoutTemplate size={32} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No templates found</p>
              <p className="text-sm mt-1">Try adjusting your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestTemplates;
