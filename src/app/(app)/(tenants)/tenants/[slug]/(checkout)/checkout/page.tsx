import { CheckoutView } from "@/modules/checkout/ui/views/checkout-view";

interface CheckoutViewProps {
  params: Promise<{ slug: string }>;
}

const CheckoutPage = async ({ params }: CheckoutViewProps) => {
  const { slug } = await params;
  return <CheckoutView tenantSlug={slug} />;
};

export default CheckoutPage;
