import React, {useState} from 'react';
import {Download, Share, X} from 'lucide-react';
import {usePWAInstall} from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{compact?: boolean}> = ({compact = false}) => {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#6D28D9] text-white font-medium transition-colors hover:bg-[#5B21B6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9] whitespace-nowrap shrink-0 ${
          compact ? 'px-3 py-2 text-xs min-h-[40px]' : 'w-full px-4 py-2.5 text-sm min-h-[44px]'
        }`}
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#DFD4EE] bg-white text-[#4C1D95] font-medium transition-colors hover:bg-[#F5F0FC] whitespace-nowrap shrink-0 ${
            compact ? 'px-3 py-2 text-xs min-h-[40px]' : 'w-full px-4 py-2.5 text-sm min-h-[44px]'
          }`}
        >
          <Share className="h-4 w-4 shrink-0" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221830]/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl border border-[#E6DDF0] bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-lg font-semibold text-[#221830]">
                  Install RituSaathi on iPhone or iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-[#5F5070] hover:bg-[#F5F0FC]"
                  aria-label="Close installation guide"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#4A3D5C]">
                <li>1. Tap the <strong>Share</strong> button in Safari’s toolbar.</li>
                <li>2. Scroll down and select <strong>Add to Home Screen</strong>.</li>
                <li>3. Tap <strong>Add</strong> for private offline access anytime.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full min-h-[44px] rounded-xl bg-[#6D28D9] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5B21B6]"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
