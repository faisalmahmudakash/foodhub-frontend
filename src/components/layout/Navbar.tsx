"use client";

import { Input } from "@/components/ui/input";
import { Menu, Search, ShoppingCart } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { loadCart } from "@/helpers/cartHelpers";
import { useState, useRef, useEffect } from "react";
import CartItemPage from "@/app/(commonLayout)/menu/cartItem/page";
import { ProductSearchResult, searchProducts } from "@/helpers/ProductApi";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface NavbarProps {
  className?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
    className?: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
}

function SearchBox({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasNavigatedRef = useRef(false);

  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  // close the dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setOpen(false);
      hasNavigatedRef.current = false;
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchProducts(trimmed);
        setSuggestions(results);
        setOpen(true);
      } catch {
        setSuggestions([]);
        setOpen(true);
      } finally {
        setSearching(false);
      }

      // First time crossing the 3-character mark, jump to /menu.
      // After that, keep ?q= in sync without piling up browser history.
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        router.push(`/menu?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.replace(`/menu?q=${encodeURIComponent(trimmed)}`, {
          scroll: false,
        });
      }
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerm(value);
    runSearch(value);
  };

  const handleSelect = (productId: string) => {
    setOpen(false);
    setTerm("");
    setSuggestions([]);
    hasNavigatedRef.current = false;
    onNavigate?.();
    router.push(`/menu?highlight=${productId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      handleSelect(suggestions[0].productId);
    }
  };

  return (
    <div className={cn("relative", className)} ref={boxRef}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={term}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Search..."
        className="w-full pl-9"
      />

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-md border bg-background shadow-md">
          {searching && (
            <div className="px-3 py-2.5 text-sm text-muted-foreground">
              Searching…
            </div>
          )}
          {!searching && suggestions.length === 0 && (
            <div className="px-3 py-2.5 text-sm text-muted-foreground">
              No matches found.
            </div>
          )}
          {!searching &&
            suggestions.map((p) => (
              <button
                key={p.productId}
                type="button"
                onClick={() => handleSelect(p.productId)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                  {p.images ? (
                    <img
                      src={p.images}
                      alt={p.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs">
                      🍽️
                    </div>
                  )}
                </div>
                <span className="truncate">{p.productName}</span>
                {p.availabilityStatus === "NOT_AVAILABLE" && (
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    Unavailable
                  </span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

const Navbar = ({
  logo = {
    url: "/",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
    alt: "logo",
    title: "FoodHub",
  },
  menu = [
    { title: "Home", url: "/" },
    { title: "Menu", url: "/menu" },
    { title: "Track Order", url: "/orderTrack" },
  ],
  auth = {
    login: { title: "Login", url: "/auth/login" },
    signup: { title: "Sign up", url: "/auth/signup" },
  },
  className,
}: NavbarProps) => {
  const router = useRouter();

  // session ana
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/auth/login";
  }

  // Navbar component-er bhetore, useSession er por:
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cart item count — synced from localStorage cart
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncCart = () => {
      const cart = loadCart();
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };
    syncCart();
    window.addEventListener("cartUpdated", syncCart);
    return () => window.removeEventListener("cartUpdated", syncCart);
  }, []);

  // Bairer click e dropdown bondho hobe
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mobile menu (hamburger) sheet + "Your Cart" sheet — both controlled so
  // tapping the cart button can close the hamburger menu and open the cart.
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);

  const handleCartClick = () => {
    setMenuSheetOpen(false);
    setCartSheetOpen(true);
  };

  const CartBadge = () =>
    cartCount > 0 ? (
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
        {cartCount}
      </span>
    ) : null;

  return (
    <section className={cn("py-4", className)}>
      <div className="container mx-auto px-10 md:px-0">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </Link>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <SearchBox className="hidden w-64 xl:block" />

            {/* Cart — on larger screens, the cart lives inline on /menu */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push("/menu")}
            >
              <ShoppingCart className="h-5 w-5" />
              <CartBadge />
            </Button>

            {/* Auth / User section */}
            {isPending ? (
              <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium hover:bg-muted"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span>{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border bg-background py-1 shadow-md">
                    <Link
                      href="/auth/profile"
                      className="block px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-muted"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href={auth.login.url}>{auth.login.title}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={auth.signup.url}>{auth.signup.title}</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
            </Link>

            <div className="flex items-center gap-1">
              {/* Cart — on mobile, opens "Your Cart" directly as a sheet */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
                <CartBadge />
              </Button>

              <Sheet open={menuSheetOpen} onOpenChange={setMenuSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <Link href={logo.url} className="flex items-center gap-2">
                        <img
                          src={logo.src}
                          className="max-h-8 dark:invert"
                          alt={logo.alt}
                        />
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  {/* search bar for mobile */}
                  <div className="px-2">
                    <SearchBox onNavigate={() => setMenuSheetOpen(false)} />
                  </div>

                  <div className="px-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleCartClick}
                    >
                      <ShoppingCart className="" />
                      Cart <span className="text-red-400">({cartCount})</span>
                    </Button>
                  </div>

                  <div className="flex flex-col gap-6 p-4">
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {menu.map((item) => renderMobileMenuItem(item))}
                    </Accordion>

                    <div className="flex flex-col gap-3">
                      {isPending ? (
                        <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
                      ) : user ? (
                        <>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 px-2 text-sm font-medium"
                          >
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
                              </div>
                            )}
                            <span>{user.name}</span>
                          </Link>
                          <Button variant="outline" onClick={handleLogout}>
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild variant="outline">
                            <Link href={auth.login.url}>
                              {auth.login.title}
                            </Link>
                          </Button>
                          <Button asChild>
                            <Link href={auth.signup.url}>
                              {auth.signup.title}
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
            <SheetContent
              side="right"
              className="w-full overflow-y-auto p-0 sm:max-w-md"
            >
              <CartItemPage />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        asChild
        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground"
      >
        <Link href={item.url}>{item.title}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
      </AccordionItem>
    );
  }

  return (
    <Link key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </Link>
  );
};

export { Navbar };
