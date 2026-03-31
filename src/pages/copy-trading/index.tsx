import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/hooks/useStore';
import { load, save_types } from '@/external/bot-skeleton';
import './copy-trading.scss';

interface Trader {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    winRate: string;
    totalProfit: string;
    followers: string;
    trades: string;
    specialty: string;
    description: string;
    fileName: string;
    verified: boolean;
    returnPct: string;
}

const TRADERS: Trader[] = [
    {
        id: 'ct1',
        name: 'Marcus Okonkwo',
        handle: '@marcus_edge',
        avatar: '👨🏿',
        winRate: '74%',
        totalProfit: '$18,340',
        followers: '2,841',
        trades: '5,217',
        specialty: 'Digits / Over-Under',
        description: 'RSI-driven digit specialist. Runs the Over Market Dream strategy with strict martingale controls. 3+ years of consistent returns.',
        fileName: 'Over_Market_Dream_2.1_1774935169248.xml',
        verified: true,
        returnPct: '+124%',
    },
    {
        id: 'ct2',
        name: 'Priya Sharma',
        handle: '@priya_asian_pro',
        avatar: '👩🏽',
        winRate: '69%',
        totalProfit: '$11,820',
        followers: '1,593',
        trades: '3,884',
        specialty: 'Asian Contracts',
        description: 'Asian contract expert on V100. Blends technical analysis with conservative position sizing for steady growth.',
        fileName: 'Asian_Pro_Dbot_1774935169326.xml',
        verified: true,
        returnPct: '+87%',
    },
    {
        id: 'ct3',
        name: 'Daniel Reeves',
        handle: '@dr_higherlow',
        avatar: '👨🏻',
        winRate: '71%',
        totalProfit: '$9,650',
        followers: '1,120',
        trades: '4,501',
        specialty: 'Rise / Fall',
        description: 'Higher/Lower specialist on V10. Uses RSI crossovers for high-probability entries with disciplined staking.',
        fileName: 'Higher_lower_Dbot_1774935169370.xml',
        verified: false,
        returnPct: '+68%',
    },
    {
        id: 'ct4',
        name: 'Sofia Mendes',
        handle: '@sofia_povertyX',
        avatar: '👩🏽',
        winRate: '66%',
        totalProfit: '$7,200',
        followers: '984',
        trades: '6,103',
        specialty: 'Scalping',
        description: 'Volatility scalper running Poverty X on V10. High trade frequency with tight risk management for fast compounding.',
        fileName: 'Poverty_X_V2.1_1774935169420.xml',
        verified: false,
        returnPct: '+53%',
    },
    {
        id: 'ct5',
        name: 'Kwame Asante',
        handle: '@kwame_evenbot',
        avatar: '👨🏿',
        winRate: '72%',
        totalProfit: '$13,470',
        followers: '2,204',
        trades: '7,890',
        specialty: 'Even / Odd Digits',
        description: 'Pattern-recognition expert on digit trading. Runs the Even Bot with advanced scalping logic and customised martingale.',
        fileName: 'Even_Bot_Free_Version_1774935169490.xml',
        verified: true,
        returnPct: '+101%',
    },
];

const CopyTrading = observer(() => {
    const { dashboard } = useStore();
    const [loadingTraderId, setLoadingTraderId] = useState<string | null>(null);
    const [copiedTraderId, setCopiedTraderId] = useState<string | null>(null);

    const copyTrader = async (trader: Trader) => {
        try {
            setLoadingTraderId(trader.id);

            const response = await fetch(`/bots/${trader.fileName}`);
            if (!response.ok) throw new Error('Failed to fetch strategy');

            const xmlContent = await response.text();

            await load({
                block_string: xmlContent,
                file_name: `${trader.name}'s Strategy`,
                workspace: (window as any).Blockly?.derivWorkspace,
                from: save_types.LOCAL,
                drop_event: null,
                strategy_id: null,
                showIncompatibleStrategyDialog: null,
            });

            setCopiedTraderId(trader.id);
            setTimeout(() => setCopiedTraderId(null), 3000);

            dashboard.setActiveTab(1);
            window.location.hash = 'bot_builder';
        } catch (error) {
            console.error('Error copying trader strategy:', error);
        } finally {
            setLoadingTraderId(null);
        }
    };

    return (
        <div className='copy-trading'>
            <div className='copy-trading__header'>
                <div className='copy-trading__header-badge'>🔗 COPY TRADING</div>
                <h1 className='copy-trading__title'>Copy Expert Traders</h1>
                <p className='copy-trading__subtitle'>
                    Follow top-performing Capital Edge traders. Copy their proven strategy into your bot builder with one click.
                </p>
            </div>

            <div className='copy-trading__leaderboard-banner'>
                <div className='copy-trading__banner-stat'>
                    <span className='copy-trading__banner-stat-value'>5</span>
                    <span className='copy-trading__banner-stat-label'>Expert Traders</span>
                </div>
                <div className='copy-trading__banner-divider' />
                <div className='copy-trading__banner-stat'>
                    <span className='copy-trading__banner-stat-value'>8,742</span>
                    <span className='copy-trading__banner-stat-label'>Total Followers</span>
                </div>
                <div className='copy-trading__banner-divider' />
                <div className='copy-trading__banner-stat'>
                    <span className='copy-trading__banner-stat-value'>+87%</span>
                    <span className='copy-trading__banner-stat-label'>Avg Annual Return</span>
                </div>
            </div>

            <div className='copy-trading__grid'>
                {TRADERS.map(trader => (
                    <div key={trader.id} className='copy-trading__card'>
                        <div className='copy-trading__card-header'>
                            <div className='copy-trading__avatar'>{trader.avatar}</div>
                            <div className='copy-trading__card-info'>
                                <div className='copy-trading__card-name-row'>
                                    <h3 className='copy-trading__card-name'>{trader.name}</h3>
                                    {trader.verified && (
                                        <span className='copy-trading__verified' title='Verified Trader'>✓</span>
                                    )}
                                </div>
                                <span className='copy-trading__card-handle'>{trader.handle}</span>
                                <span className='copy-trading__card-specialty'>{trader.specialty}</span>
                            </div>
                            <div className='copy-trading__return-badge'>
                                <span>{trader.returnPct}</span>
                                <span className='copy-trading__return-label'>return</span>
                            </div>
                        </div>

                        <p className='copy-trading__card-description'>{trader.description}</p>

                        <div className='copy-trading__card-metrics'>
                            <div className='copy-trading__metric'>
                                <span className='copy-trading__metric-value copy-trading__metric-value--green'>{trader.winRate}</span>
                                <span className='copy-trading__metric-label'>Win Rate</span>
                            </div>
                            <div className='copy-trading__metric'>
                                <span className='copy-trading__metric-value copy-trading__metric-value--gold'>{trader.totalProfit}</span>
                                <span className='copy-trading__metric-label'>Total Profit</span>
                            </div>
                            <div className='copy-trading__metric'>
                                <span className='copy-trading__metric-value'>{trader.followers}</span>
                                <span className='copy-trading__metric-label'>Followers</span>
                            </div>
                            <div className='copy-trading__metric'>
                                <span className='copy-trading__metric-value'>{trader.trades}</span>
                                <span className='copy-trading__metric-label'>Trades</span>
                            </div>
                        </div>

                        <button
                            className={`copy-trading__card-btn ${copiedTraderId === trader.id ? 'copy-trading__card-btn--copied' : ''}`}
                            onClick={() => copyTrader(trader)}
                            disabled={loadingTraderId === trader.id}
                        >
                            {loadingTraderId === trader.id ? (
                                <span className='copy-trading__card-btn-loading'>Copying...</span>
                            ) : copiedTraderId === trader.id ? (
                                <span>✓ Strategy Loaded!</span>
                            ) : (
                                <span>🔗 Copy Strategy</span>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className='copy-trading__disclaimer'>
                <p>Results shown are simulated for demonstration purposes. Capital Edge copy trading loads proven bot strategies into your builder. Always test with a demo account before going live.</p>
            </div>
        </div>
    );
});

export default CopyTrading;
