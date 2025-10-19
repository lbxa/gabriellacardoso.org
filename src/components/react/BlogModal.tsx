import { useEffect, useState } from "react";

interface BlogPost {
  slug: string;
  title: string;
  description?: string;
  author: string;
  date: string;
  formattedDate: string;
}

interface BlogModalProps {
  posts: BlogPost[];
}

export default function BlogModal({ posts }: BlogModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">(
    "sans",
  );
  const [mounted, setMounted] = useState(false);

  const MIN_FONT_SIZE = 14;
  const MAX_FONT_SIZE = 24;
  const FONT_SIZE_STEP = 2;

  // Only run client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedFontSize = localStorage.getItem("blog-font-size");
    const savedFontFamily = localStorage.getItem("blog-font-family");

    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
    if (savedFontFamily) {
      setFontFamily(savedFontFamily as "sans" | "serif" | "mono");
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem("blog-font-size", fontSize.toString());
    localStorage.setItem("blog-font-family", fontFamily);
  }, [fontSize, fontFamily]);

  // Handle URL hash changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#blog/")) {
        const slug = hash.replace("#blog/", "");
        setCurrentSlug(slug);
        setIsOpen(true);
      } else if (isOpen) {
        setIsOpen(false);
        setCurrentSlug(null);
      }
    };

    // Check initial hash
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [isOpen]);

  // Handle blog card clicks
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClick = (e: MouseEvent) => {
      if (window.location.pathname !== "/") return;

      const target = e.target as HTMLElement;
      const blogCard = target.closest("[data-blog-slug]");

      if (blogCard) {
        e.preventDefault();
        e.stopPropagation();
        const slug = blogCard.getAttribute("data-blog-slug");
        if (slug) {
          setCurrentSlug(slug);
          setIsOpen(true);
          window.history.pushState(null, "", `#blog/${slug}`);
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // Handle ESC key
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Manage body overflow
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
    setCurrentSlug(null);
    if (
      typeof window !== "undefined" &&
      window.location.hash.startsWith("#blog/")
    ) {
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  // Get content HTML from the server-rendered DOM
  const getContentHtml = (slug: string) => {
    if (typeof window === "undefined") return "";
    const contentEl = document.getElementById(`blog-content-${slug}`);
    return contentEl ? contentEl.innerHTML : "";
  };

  // Don't render until mounted client-side
  if (!mounted) {
    return null;
  }

  const increaseFontSize = () => {
    if (fontSize < MAX_FONT_SIZE) {
      setFontSize((prev) => prev + FONT_SIZE_STEP);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > MIN_FONT_SIZE) {
      setFontSize((prev) => prev - FONT_SIZE_STEP);
    }
  };

  const currentPost = posts.find((post) => post.slug === currentSlug);

  const fontFamilyClass =
    fontFamily === "serif"
      ? "font-serif"
      : fontFamily === "mono"
        ? "font-mono"
        : "font-sans";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl transition-all">
              {/* Close Button */}
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Reading Tools */}
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-gray-100 p-2">
                {/* Font Size Controls */}
                <button
                  type="button"
                  onClick={decreaseFontSize}
                  className="rounded-full p-2 transition-colors hover:bg-gray-200"
                  aria-label="Decrease font size"
                  title="Decrease font size"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="pointer-events-none size-5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="w-8 text-center text-sm font-medium text-gray-700">
                  A
                </span>
                <button
                  type="button"
                  onClick={increaseFontSize}
                  className="rounded-full p-2 transition-colors hover:bg-gray-200"
                  aria-label="Increase font size"
                  title="Increase font size"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="pointer-events-none size-5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>

                <div className="h-6 w-px bg-gray-300" />

                {/* Font Family Controls */}
                <button
                  type="button"
                  onClick={() => setFontFamily("sans")}
                  className={`rounded-full px-3 py-2 text-sm font-medium 
                transition-colors ${
                  fontFamily === "sans"
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-200"
                }`}
                  title="Sans-serif font"
                >
                  Sans
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily("serif")}
                  className={`rounded-full px-3 py-2 text-sm font-medium 
                transition-colors ${
                  fontFamily === "serif"
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-200"
                }`}
                  title="Serif font"
                >
                  Serif
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily("mono")}
                  className={`rounded-full px-3 py-2 font-mono text-sm 
                transition-colors ${
                  fontFamily === "mono"
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-200"
                }`}
                  title="Monospace font"
                >
                  Mono
                </button>
              </div>

              {/* Content Container */}
              <div
                className={`max-h-[85vh] overflow-y-auto p-6 pt-20 sm:p-8 
              md:p-12 ${fontFamilyClass}`}
                style={{
                  fontSize: `${fontSize}px`,
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {currentPost && (
                  <>
                    <header className="mb-xl">
                      <h1 id="modal-title" className="mb-md text-5xl font-bold">
                        {currentPost.title}
                      </h1>
                      {currentPost.description && (
                        <p className="mb-md text-xl text-gray-700">
                          {currentPost.description}
                        </p>
                      )}
                      <div className="flex gap-md text-sm text-gray-600">
                        <time dateTime={currentPost.date}>
                          {currentPost.formattedDate}
                        </time>
                        <span>·</span>
                        <span>{currentPost.author}</span>
                      </div>
                    </header>
                    <div
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: getContentHtml(currentPost.slug),
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <style>{`
            .modal-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
