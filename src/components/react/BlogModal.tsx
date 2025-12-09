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

  // const FONT_SIZE_SMALL = 14;
  // const FONT_SIZE_MEDIUM = 18;
  // const FONT_SIZE_LARGE = 24;

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
                className="absolute right-4 top-4 z-10 rounded-full bg-gray-100/80 p-2 backdrop-blur-sm transition-colors hover:bg-gray-200"
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
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-gray-100/80 p-2 backdrop-blur-sm">
                {/* Font Size Controls */}
                {/* <button
                  type="button"
                  onClick={() => setFontSizePreset(FONT_SIZE_SMALL)}
                  className={`flex size-10 items-center justify-center 
                  rounded-full text-xs font-medium transition-colors ${
                    fontSize === FONT_SIZE_SMALL
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-200"
                  }`}
                  aria-label="Small font size"
                  title="Small font size"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizePreset(FONT_SIZE_MEDIUM)}
                  className={`flex size-10 items-center justify-center 
                  rounded-full text-base font-medium transition-colors ${
                    fontSize === FONT_SIZE_MEDIUM
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-200"
                  }`}
                  aria-label="Medium font size"
                  title="Medium font size"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSizePreset(FONT_SIZE_LARGE)}
                  className={`flex size-10 items-center justify-center 
                  rounded-full text-xl font-medium transition-colors ${
                    fontSize === FONT_SIZE_LARGE
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-200"
                  }`}
                  aria-label="Large font size"
                  title="Large font size"
                >
                  A
                </button>

                <div className="h-6 w-px bg-gray-300" /> */}

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
                  className={`rounded-full px-3 py-2 font-serif text-sm
                font-medium transition-colors ${
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
                className={`max-h-[85vh] overflow-y-auto px-6 py-12 pt-24 
                sm:px-10 sm:py-16 md:px-16 md:py-20 ${fontFamilyClass}`}
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {currentPost && (
                  <>
                    <header className="mb-16">
                      <h1
                        id="modal-title"
                        className="mb-6 text-4xl font-bold leading-[1.15] 
                        sm:text-5xl md:text-6xl lg:text-7xl sm:leading-[1.15]"
                      >
                        {currentPost.title}
                      </h1>
                      {currentPost.description && (
                        <p className="mb-md text-xl sm:text-2xl leading-relaxed text-gray-700">
                          {currentPost.description}
                        </p>
                      )}
                      <div className="flex gap-md text-base text-gray-600">
                        <time dateTime={currentPost.date}>
                          {currentPost.formattedDate}
                        </time>
                        <span>·</span>
                        <span>{currentPost.author}</span>
                      </div>
                    </header>
                    <div
                      className="prose prose-lg max-w-none"
                      style={{ fontSize: `${fontSize}px` }}
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
