import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { load, save_types } from '@/external/bot-skeleton';
import './speed-bots.scss';

interface SpeedBot {
    id: string;
    name: string;
    description: string;
    fileName: string;
    executionTime: string;
    winRate: string;
    icon: string;
    tag: string;
}

const SPEED_BOTS: SpeedBot[] = [
    {
        id: 'sb1',
        name: 'Over Market Dream v2.1',
        description: 'Lightning-fast over/under digit strategy. RSI-powered entries on V100 with instant tick execution.',
        fileName: 'Over_Market_Dream_2.1_1774935169248.xml',
        executionTime: '< 1s',
        winRate: '68%',
        icon: '💎',
        tag: 'DIGITS',
    },
    {
        id: 'sb2',
        name: 'Higher / Lower Speed Bot',
        description: 'Rapid-fire higher/lower execution on V10. RSI-driven direction with martingale recovery.',
        fileName: 'Higher_lower_Dbot_1774935169370.xml',
        executionTime: '< 1s',
        winRate: '71%',
        icon: '⚡',
        tag: 'RISE/FALL',
    },
    {
        id: 'sb3',
        name: 'Poverty X V2.1',
        description: 'Ultra-fast rise/fall execution. Dual-direction RSI signals for rapid market scalping.',
        fileName: 'Poverty_X_V2.1_1774935169420.xml',
        executionTime: '< 1s',
        winRate: '65%',
        icon: '🚀',
        tag: 'SCALPER',
    },
];

const SpeedBots = observer(() => {
    const { dashboard } = useStore();
    const [loadingBotId, setLoadingBotId] = useState<string | null>(null);

    const loadBot = async (bot: SpeedBot) => {
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
            console.error('Error loading speed bot:', error);
        } finally {
            setLoadingBotId(null);
        }
    };

    return (
        <div className='speed-bots'>
            <div className='speed-bots__header'>
                <div className='speed-bots__header-badge'>⚡ SPEED BOTS</div>
                <h1 className='speed-bots__title'>Execute at Lightning Speed</h1>
                <p className='speed-bots__subtitle'>
                    Optimised for rapid tick-by-tick execution. These bots act in under a second — built for traders who demand speed.
                </p>
            </div>

            <div className='speed-bots__stats-bar'>
                <div className='speed-bots__stat'>
                    <span className='speed-bots__stat-value'>3</span>
                    <span className='speed-bots__stat-label'>Speed Strategies</span>
                </div>
                <div className='speed-bots__stat-divider' />
                <div className='speed-bots__stat'>
                    <span className='speed-bots__stat-value'>&lt; 1s</span>
                    <span className='speed-bots__stat-label'>Avg Execution</span>
                </div>
                <div className='speed-bots__stat-divider' />
                <div className='speed-bots__stat'>
                    <span className='speed-bots__stat-value'>RSI</span>
                    <span className='speed-bots__stat-label'>Core Indicator</span>
                </div>
            </div>

            <div className='speed-bots__grid'>
                {SPEED_BOTS.map(bot => (
                    <div key={bot.id} className='speed-bots__card'>
                        <div className='speed-bots__card-glow' />
                        <div className='speed-bots__card-top'>
                            <span className='speed-bots__card-icon'>{bot.icon}</span>
                            <span className='speed-bots__card-tag'>{bot.tag}</span>
                        </div>
                        <h3 className='speed-bots__card-title'>{bot.name}</h3>
                        <p className='speed-bots__card-description'>{bot.description}</p>

                        <div className='speed-bots__card-metrics'>
                            <div className='speed-bots__metric'>
                                <span className='speed-bots__metric-label'>Execution</span>
                                <span className='speed-bots__metric-value speed-bots__metric-value--gold'>{bot.executionTime}</span>
                            </div>
                            <div className='speed-bots__metric'>
                                <span className='speed-bots__metric-label'>Win Rate*</span>
                                <span className='speed-bots__metric-value speed-bots__metric-value--green'>{bot.winRate}</span>
                            </div>
                        </div>

                        <button
                            className='speed-bots__card-btn'
                            onClick={() => loadBot(bot)}
                            disabled={loadingBotId === bot.id}
                        >
                            {loadingBotId === bot.id ? (
                                <span className='speed-bots__card-btn-loading'>Loading...</span>
                            ) : (
                                <>
                                    <span>⚡ Deploy Now</span>
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className='speed-bots__disclaimer'>
                <p>*Win rates are indicative based on backtesting. Past performance does not guarantee future results. Always use a demo account to test before trading live.</p>
            </div>
        </div>
    );
});

export default SpeedBots;
