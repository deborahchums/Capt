import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { load, save_types } from '@/external/bot-skeleton';
import './free-bots.scss';

interface Bot {
    id: string;
    name: string;
    description: string;
    fileName: string;
    category: string;
    icon: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const BOTS: Bot[] = [
    {
        id: '1',
        name: 'Over Market Dream v2.1',
        description: 'RSI-powered over/under digit trading on Volatility 100. Uses martingale recovery with smart RSI entry signals.',
        fileName: 'Over_Market_Dream_2.1_1774935169248.xml',
        category: 'Digits',
        icon: '💎',
        difficulty: 'Intermediate',
    },
    {
        id: '2',
        name: 'Asian Pro Bot',
        description: 'Professional Asian contract bot with martingale recovery. Targets consistent profits on V100 index.',
        fileName: 'Asian_Pro_Dbot_1774935169326.xml',
        category: 'Asian',
        icon: '🏆',
        difficulty: 'Advanced',
    },
    {
        id: '3',
        name: 'Higher / Lower Bot',
        description: 'RSI-based higher/lower strategy on V10 index. Smart signal detection with martingale staking.',
        fileName: 'Higher_lower_Dbot_1774935169370.xml',
        category: 'Rise/Fall',
        icon: '📊',
        difficulty: 'Intermediate',
    },
    {
        id: '4',
        name: 'Poverty X V2.1',
        description: 'Rise/fall RSI bot on Volatility 10. Dual direction trading with intelligent stake management.',
        fileName: 'Poverty_X_V2.1_1774935169420.xml',
        category: 'Rise/Fall',
        icon: '⚡',
        difficulty: 'Beginner',
    },
    {
        id: '5',
        name: 'Even Bot Free Edition',
        description: 'Pattern-based even/odd digit bot on V100. Advanced scalping with configurable martingale and profit targets.',
        fileName: 'Even_Bot_Free_Version_1774935169490.xml',
        category: 'Even/Odd',
        icon: '🎯',
        difficulty: 'Advanced',
    },
];

const difficultyColor: Record<string, string> = {
    Beginner: '#22c55e',
    Intermediate: '#f59e0b',
    Advanced: '#d4af37',
};

const FreeBots = observer(() => {
    const { dashboard } = useStore();
    const [loadingBotId, setLoadingBotId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = ['All', ...Array.from(new Set(BOTS.map(bot => bot.category)))];

    const filteredBots = selectedCategory === 'All'
        ? BOTS
        : BOTS.filter(bot => bot.category === selectedCategory);

    const loadBot = async (bot: Bot) => {
        try {
            setLoadingBotId(bot.id);

            const response = await fetch(`/bots/${bot.fileName}`);
            if (!response.ok) throw new Error('Failed to fetch bot file');

            const xmlContent = await response.text();

            await load({
                block_string: xmlContent,
                file_name: bot.name,
                workspace: (window as any).Blockly?.derivWorkspace,
                from: save_types.LOCAL,
                drop_event: null,
                strategy_id: null,
                showIncompatibleStrategyDialog: null,
            });

            dashboard.setActiveTab(1);
            window.location.hash = 'bot_builder';
        } catch (error) {
            console.error('Error loading bot:', error);
        } finally {
            setLoadingBotId(null);
        }
    };

    return (
        <div className='free-bots'>
            <div className='free-bots__header'>
                <h1 className='free-bots__title'>Capital Edge Bots</h1>
                <p className='free-bots__subtitle'>
                    Handpicked automated strategies built for edge. Load any bot directly into the builder and start trading.
                </p>
            </div>

            <div className='free-bots__categories'>
                {categories.map(category => (
                    <button
                        key={category}
                        className={`free-bots__category-btn ${selectedCategory === category ? 'free-bots__category-btn--active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className='free-bots__grid'>
                {filteredBots.map(bot => (
                    <div key={bot.id} className='free-bots__card'>
                        <div className='free-bots__card-header'>
                            <span className='free-bots__card-icon'>{bot.icon}</span>
                            <div className='free-bots__card-badges'>
                                <span className='free-bots__card-category'>{bot.category}</span>
                                <span
                                    className='free-bots__card-difficulty'
                                    style={{ color: difficultyColor[bot.difficulty] }}
                                >
                                    {bot.difficulty}
                                </span>
                            </div>
                        </div>
                        <h3 className='free-bots__card-title'>{bot.name}</h3>
                        <p className='free-bots__card-description'>{bot.description}</p>
                        <button
                            className='free-bots__card-btn'
                            onClick={() => loadBot(bot)}
                            disabled={loadingBotId === bot.id}
                        >
                            {loadingBotId === bot.id ? (
                                <span className='free-bots__card-btn-loading'>Loading...</span>
                            ) : (
                                <>
                                    <span>Load Bot</span>
                                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                        <path d='M5 12h14M12 5l7 7-7 7' />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className='free-bots__footer'>
                <p>All bots are provided for educational purposes. Always test with a demo account first.</p>
            </div>
        </div>
    );
});

export default FreeBots;
