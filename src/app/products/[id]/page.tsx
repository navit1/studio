
"use client"; // Making this a client component to use useLanguage for full translation.
import { useEffect, useState } from 'react';
import { getProductById, getReviewsByProductId } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/products/StarRating';
import { ProductReviewManagement } from '@/components/products/ProductReviewManagement';
import { AddToCartButton } from './AddToCartButton'; 
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tag, Package, ListChecks, TruckIcon, CreditCardIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { getPluralNoun } from '@/lib/i18nUtils';
import type { Product, Review as ReviewType } from '@/types'; // Explicitly import types
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

// export async function generateMetadata({ params }: { params: { id: string } }) {
//   // Metadata generation for dynamic routes in client components is handled differently or via parent layouts.
//   // For client components, you might set document.title directly in a useEffect.
//   const product = getProductById(params.id);
//   if (!product) {
//     return { title: 'Товар не найден' };
//   }
//   return {
//     title: product.name,
//     description: product.description,
//   };
// }

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { translate } = useLanguage();
  const [product, setProduct] = useState<Product | null | undefined>(undefined); // undefined for loading, null for not found
  const [initialReviews, setInitialReviews] = useState<ReviewType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchedProduct = getProductById(id);
      setProduct(fetchedProduct);
      if (fetchedProduct) {
        const fetchedReviews = getReviewsByProductId(id);
        setInitialReviews(fetchedReviews);
        document.title = `${fetchedProduct.name} - ${translate('app.name')}`;
      } else {
        document.title = `${translate('product.product_not_found_title', {defaultValue: 'Product Not Found'})} - ${translate('app.name')}`;
      }
      setIsLoading(false);
    }
  }, [id, translate]);

  if (isLoading) {
    return (
      <div className="space-y-12">
        <Card className="overflow-hidden shadow-lg">
          <div className="grid md:grid-cols-2 gap-0 md:gap-8">
            <div className="md:p-8">
              <Skeleton className="aspect-video bg-muted rounded-lg w-full h-[300px] md:h-[400px]" />
            </div>
            <div className="p-6 md:p-8 flex flex-col">
              <Skeleton className="h-6 w-1/4 mb-2" /> {/* Badge */}
              <Skeleton className="h-10 w-3/4 mb-2" /> {/* Title */}
              <Skeleton className="h-4 w-1/2 mb-4" /> {/* Brand & Rating */}
              <Skeleton className="h-8 w-1/3 mb-4" /> {/* Price */}
              <Skeleton className="h-20 w-full mb-6" /> {/* Description */}
              <Skeleton className="h-10 w-full" /> {/* Add to cart button area */}
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  if (!product) {
    notFound(); // Or display a custom "Product not found" message translated
  }

  const averageRating = initialReviews.length > 0 
    ? initialReviews.reduce((sum, review) => sum + review.rating, 0) / initialReviews.length
    : 0;

  const reviewNoun = getPluralNoun(
    initialReviews.length,
    translate('noun.review.one'),
    translate('noun.review.few'),
    translate('noun.review.many')
  );
  
  const stockNoun = getPluralNoun(
    product.stock,
    translate('noun.item.one'),
    translate('noun.item.few'),
    translate('noun.item.many')
  );


  return (
    <div className="space-y-12">
      <Card className="overflow-hidden shadow-lg">
        <div className="grid md:grid-cols-2 gap-0 md:gap-8">
          <div className="md:p-8">
             <div className="aspect-video bg-muted rounded-lg" data-ai-hint="product detail placeholder">
              {/* Placeholder for product image, actual image component would go here */}
            </div>
          </div>
          <div className="p-6 md:p-8 flex flex-col">
            <CardHeader className="p-0">
              <Badge variant="secondary" className="w-fit mb-2">{translate(`category.${product.categoryId}`, { defaultValue: product.categoryName })}</Badge>
              <CardTitle className="text-3xl lg:text-4xl font-bold text-foreground">{product.name}</CardTitle> {/* Product name is not translated as it's data */}
              {product.brand && <p className="text-sm text-muted-foreground">{translate('product.brand')}: {product.brand}</p>}
              <div className="flex items-center space-x-2 mt-2">
                <StarRating rating={averageRating} size="md" />
                <span className="text-sm text-muted-foreground">{translate('product.reviews_count_parentheses', {count: initialReviews.length, noun: reviewNoun} )}</span>
              </div>
            </CardHeader>

            <CardContent className="p-0 mt-6 flex-grow">
              <p className="text-3xl font-extrabold text-primary mb-4">₸{product.price.toFixed(2)}</p>
              <CardDescription className="text-base text-foreground/80 leading-relaxed">
                {product.description} {/* Product description is not translated as it's data */}
              </CardDescription>
              
              {product.features && product.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><ListChecks className="w-5 h-5 mr-2 text-primary" />{translate('product.characteristics')}</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li> // Features are data
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                {product.sku && <p className="flex items-center"><Tag className="w-4 h-4 mr-2 text-primary/70" />{translate('product.sku')}: {product.sku}</p>}
                <p className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-primary/70" />
                    {translate('product.availability')}: {product.stock > 0 
                        ? translate('product.availability_available', { stock: product.stock, noun: stockNoun}) 
                        : translate('product.availability_out_of_stock')}
                </p>
              </div>

            </CardContent>
            
            <div className="mt-auto pt-6 space-y-4">
               <AddToCartButton product={product} />
               <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center"><TruckIcon className="w-4 h-4 mr-2 text-primary/70" />{translate('product.delivery_estimate')}</p>
                  <p className="flex items-center"><CreditCardIcon className="w-4 h-4 mr-2 text-primary/70" />{translate('product.payment_methods_note')}</p>
               </div>
            </div>
          </div>
        </div>
      </Card>

      <Separator />

      <ProductReviewManagement productId={product.id} initialReviews={initialReviews} />
      
      <Separator />

    </div>
  );
}
