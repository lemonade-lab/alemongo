import useTheme from "@/hook/useTheme";

const ThemeToggle = () => {
  const {dark, setDark} = useTheme();
  return (
    <button
      className="p-1 size-8 rounded-full bg-gray-200  text-black dark:text-white dark:bg-gray-700 transition"
      onClick={() => setDark(!dark)}
      aria-label="切换黑白主题"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
};
export default ThemeToggle;
