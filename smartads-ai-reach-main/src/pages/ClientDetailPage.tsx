import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClient } from '../hooks/useClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building, MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading';

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: client, isLoading, error } = useClient(id || '');
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingState>Loading client details...</LoadingState>;
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Client Not Found</h1>
        </div>
        <p className="text-muted-foreground">The requested client could not be found.</p>
        <Button className="mt-4" onClick={() => navigate('/clients')}>
          Back to Clients
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <Badge variant={client.is_active ? 'default' : 'secondary'} className="ml-2">
          {client.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
            <div className="space-y-4">
              {client.contact_person && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{client.contact_person}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${client.email}`} className="hover:underline">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${client.phone}`} className="hover:underline">
                    {client.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Additional Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Added on {new Date(client.created_at).toLocaleDateString()}</span>
              </div>
              {client.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>{client.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-1 lg:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Client Details</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/clients/${client.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Client
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
            
            {client.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {client.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;
