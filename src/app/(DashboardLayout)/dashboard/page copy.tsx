"use client";

import Banner from "@/components/ui/banner";
import UserProfileCard from "@/components/ui/user-profile";
import FeatureLocked from "@/components/ui/feature-locked";

export default function DashboardPage() {
  return (
    <>
      <div className=":data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @5xl/main:grid-cols-4">
        <div className="col-span-3">
          <Banner
            title={"Try Dora for \nfree now!"}
            description="Enter in this creative world. Venus is the best product for your business."
            buttonText="Try For Free"
            onButtonClick={() => alert("Mulai free trial!")}
            imgSrc="/images/banner/Image.png"
            imgAlt="Preview Dora"
            imgWidth={250}
            imgHeight={200}
            className="w-full h-full"
          />
        </div>
        <div className="col-span-1 h-full">
          <UserProfileCard
            name="Jane Doe"
            location="Jakarta, Indonesia"
            avatar="/images/avatar/Avatar.png"
            projects={12}
            followers={1200}
            following={300}
          />
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 z-10 pointer-events-auto px-6">
          <FeatureLocked />
        </div>
      </div>
    </>
  );
}
