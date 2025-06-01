"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Users,
  Receipt,
  Clock,
  Smartphone,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const features = [
  {
    name: "Easy Bill Splitting",
    description:
      "Split bills with friends in just a few taps. No more complicated math or awkward money discussions.",
    icon: Receipt,
  },
  {
    name: "Real-time Updates",
    description:
      "See who's paid and who hasn't in real-time. Never lose track of who owes what.",
    icon: Clock,
  },
  {
    name: "Group Management",
    description:
      "Create groups for roommates, trips, or regular outings and manage expenses together.",
    icon: Users,
  },
  {
    name: "Mobile Friendly",
    description:
      "Access your splits on the go with our mobile-optimized interface.",
    icon: Smartphone,
  },
];

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Frequent Traveler",
    content:
      "SplitSmart made our group trip so much easier! No more spreadsheets or arguments about who paid for what.",
  },
  {
    name: "Jordan Smith",
    role: "College Student",
    content:
      "As someone who splits bills with roommates, this app has been a game-changer. Super intuitive and saves us so much time!",
  },
  {
    name: "Taylor Wilson",
    role: "Event Organizer",
    content:
      "Organizing group dinners used to be a hassle. Now with SplitSmart, everything is transparent and easy to manage.",
  },
];

export default function HomePage() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, router]);

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
              Split bills with friends, the easy way
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              SplitSmart takes the hassle out of splitting expenses. Whether
              it's rent, dinner, or a group trip, we make sure everyone pays
              their fair share.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link
                href="#features"
                className="text-sm font-semibold leading-6 text-foreground hover:text-foreground/80 transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl p-2 ring-1 ring-border/50 lg:-m-4 lg:rounded-2xl lg:p-4 bg-card/50">
              <img
                src="/dashboard-image.png"
                alt="App screenshot"
                className="rounded-md shadow-2xl ring-1 ring-border/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Split expenses effortlessly
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to split bills fairly
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              SplitSmart is designed to make your life easier when it comes to
              managing shared expenses.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-foreground">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <feature.icon
                        className="h-6 w-6 text-primary-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-muted-foreground">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="bg-muted/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by thousands
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Join the thousands of people who have simplified their shared
              expenses with SplitSmart.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex flex-col justify-between bg-card p-8 shadow-sm ring-1 ring-border/50 sm:p-10 rounded-xl hover:ring-primary/50 transition-all"
              >
                <div>
                  <div className="flex items-center gap-x-4">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    "{testimonial.content}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl bg-gradient-to-r from-primary to-primary/90 px-6 py-16 text-center sm:p-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to simplify your shared expenses?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
              Join thousands of happy users who have made bill splitting a
              breeze.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/sign-up"
                className="rounded-md bg-background px-3.5 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-background/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-background transition-colors"
              >
                Get started
              </Link>
              <Link
                href="#"
                className="text-sm font-semibold leading-6 text-primary-foreground/90 hover:text-primary-foreground transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
