import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse, Shop, Review } from '@/lib/types';

interface ShopWithReviews extends Shop {
  reviews: Review[];
  average_rating: number;
  total_reviews: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch shop details with photos and mechanics
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select(`
        *,
        photos:shop_photos(*),
        mechanics:mechanics(*)
      `)
      .eq('id', id)
      .single();

    if (shopError || !shop) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Bengkel tidak ditemukan',
        },
        { status: 404 }
      );
    }

    // Fetch reviews with user information
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(full_name, email)
      `)
      .eq('shop_id', id)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    }

    // Calculate average rating
    const validReviews = reviews || [];
    const totalReviews = validReviews.length;
    const averageRating = totalReviews > 0
      ? validReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    const shopWithReviews: ShopWithReviews = {
      ...shop,
      reviews: validReviews,
      average_rating: averageRating,
      total_reviews: totalReviews,
    };

    return NextResponse.json<ApiResponse<ShopWithReviews>>({
      success: true,
      data: shopWithReviews,
    });
  } catch (error) {
    console.error('Error fetching shop details:', error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Terjadi kesalahan saat mengambil data bengkel',
      },
      { status: 500 }
    );
  }
}
