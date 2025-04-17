import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				clay: {
					mint: '#1adb9a',
					lavender: '#6a5aff',
					blue: '#3a95ff',
					peach: '#ff8a65',
					base: '#1a1d23',
					pink: '#ff5e95'
				}
			},
			borderRadius: {
				clay: '1.25rem',
				'clay-lg': '1.5rem',
			},
			boxShadow: {
				'clay-sm': '0 4px 12px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 255, 165, 0.1)',
				'clay-md': '0 8px 16px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 255, 165, 0.1)',
				'clay-lg': '0 12px 24px rgba(0, 0, 0, 0.3), 0 3px 6px rgba(0, 255, 165, 0.15)',
				'clay-inner': 'inset 0 2px 5px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 255, 165, 0.05)',
				'clay-button': '0 6px 12px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 255, 165, 0.1)',
				'clay-button-pressed': 'inset 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2)',
				'neon-glow': '0 0 15px rgba(0, 255, 165, 0.5), 0 0 30px rgba(0, 255, 165, 0.2)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 10px rgba(0, 255, 165, 0.4), 0 0 20px rgba(0, 255, 165, 0.2)'
					},
					'50%': { 
						boxShadow: '0 0 15px rgba(0, 255, 165, 0.6), 0 0 30px rgba(0, 255, 165, 0.3)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 5s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
