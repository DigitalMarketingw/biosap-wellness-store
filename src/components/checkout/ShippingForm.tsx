
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface ShippingFormProps {
  shippingInfo: ShippingInfo;
  validationErrors: { [key: string]: string };
  onInputChange: (field: string, value: string) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  shippingInfo,
  validationErrors,
  onInputChange
}) => {
  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="text-green-800">Shipping Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={shippingInfo.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              required
              className={`border-green-200 ${validationErrors.firstName ? 'border-red-500' : ''}`}
            />
            {validationErrors.firstName && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={shippingInfo.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              required
              className={`border-green-200 ${validationErrors.lastName ? 'border-red-500' : ''}`}
            />
            {validationErrors.lastName && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={shippingInfo.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            required
            className={`border-green-200 ${validationErrors.email ? 'border-red-500' : ''}`}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={shippingInfo.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            required
            placeholder="10-digit mobile number"
            className={`border-green-200 ${validationErrors.phone ? 'border-red-500' : ''}`}
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={shippingInfo.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            required
            className={`border-green-200 ${validationErrors.address ? 'border-red-500' : ''}`}
          />
          {validationErrors.address && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={shippingInfo.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              required
              className={`border-green-200 ${validationErrors.city ? 'border-red-500' : ''}`}
            />
            {validationErrors.city && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
            )}
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={shippingInfo.state}
              onChange={(e) => onInputChange('state', e.target.value)}
              required
              className={`border-green-200 ${validationErrors.state ? 'border-red-500' : ''}`}
            />
            {validationErrors.state && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.state}</p>
            )}
          </div>
          <div>
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              value={shippingInfo.pincode}
              onChange={(e) => onInputChange('pincode', e.target.value)}
              required
              placeholder="6-digit pincode"
              className={`border-green-200 ${validationErrors.pincode ? 'border-red-500' : ''}`}
            />
            {validationErrors.pincode && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.pincode}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingForm;
