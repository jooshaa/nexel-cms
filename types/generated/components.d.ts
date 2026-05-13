import type { Schema, Struct } from '@strapi/strapi';

export interface ProductColor extends Struct.ComponentSchema {
  collectionName: 'components_product_colors';
  info: {
    description: 'A product color variant';
    displayName: 'Color';
  };
  attributes: {
    hex: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 9;
      }>;
    image: Schema.Attribute.Media<'images'>;
    inStock: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
  };
}

export interface ProductSpecification extends Struct.ComponentSchema {
  collectionName: 'components_product_specifications';
  info: {
    description: 'A single product specification key-value pair';
    displayName: 'Specification';
  };
  attributes: {
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    value: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'product.color': ProductColor;
      'product.specification': ProductSpecification;
    }
  }
}
